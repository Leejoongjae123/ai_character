from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import logging
from typing import Optional
import asyncio
from mangum import Mangum

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Image Upload Service",
    description="Presigned URL을 이용한 이미지 업로드 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """헬스체크 엔드포인트"""
    return {"message": "Image Upload Service is running"}

@app.post("/upload-with-presigned")
async def upload_with_presigned(
    file: UploadFile = File(...),
    uploadUrl: str = Form(...)
):
    """
    Presigned URL을 이용해서 파일을 업로드하는 엔드포인트
    
    Args:
        file: 업로드할 파일
        uploadUrl: S3 presigned URL
    
    Returns:
        업로드 결과
    """
    try:
        logger.info("업로드 요청 시작")
        
        # 파일 정보 로깅
        file_info = {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size if hasattr(file, 'size') else "unknown"
        }
        logger.info(f"파일 정보: {file_info}")
        
        if not file or not uploadUrl:
            logger.error("필수 데이터 누락")
            raise HTTPException(
                status_code=400,
                detail="파일 또는 업로드 URL이 제공되지 않았습니다."
            )
        
        # 파일 내용 읽기
        logger.info("파일 내용 읽기 시작")
        file_content = await file.read()
        file_size = len(file_content)
        logger.info(f"파일 읽기 완료, 크기: {file_size} bytes")
        
        # presigned URL로 업로드
        logger.info(f"presigned URL로 업로드 시작: {uploadUrl[:50]}...")
        
        headers = {
            'Content-Type': file.content_type or 'application/octet-stream',
            'Content-Length': str(file_size),
        }
        
        # httpx를 사용해서 비동기 업로드
        timeout = httpx.Timeout(300.0)  # 5분 타임아웃
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            upload_response = await client.put(
                uploadUrl,
                content=file_content,
                headers=headers
            )
        
        logger.info(f"업로드 응답: {upload_response.status_code} - {upload_response.reason_phrase}")
        
        if upload_response.status_code not in [200, 201, 204]:
            error_text = upload_response.text[:200] if upload_response.text else "No error details"
            logger.error(f"업로드 실패: {upload_response.status_code} - {error_text}")
            
            raise HTTPException(
                status_code=500,
                detail=f"업로드 실패: {upload_response.status_code} - {error_text}"
            )
        
        logger.info("업로드 성공")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "업로드 완료",
                "status": upload_response.status_code,
                "file_size": file_size,
                "filename": file.filename
            }
        )
        
    except HTTPException:
        # HTTPException은 그대로 재발생
        raise
    except Exception as e:
        logger.error(f"업로드 API 에러: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"서버 오류가 발생했습니다: {str(e)}"
        )

@app.post("/upload-with-presigned-retry")
async def upload_with_presigned_retry(
    file: UploadFile = File(...),
    uploadUrl: str = Form(...),
    max_retries: int = Form(default=3)
):
    """
    재시도 로직이 포함된 업로드 엔드포인트
    
    Args:
        file: 업로드할 파일
        uploadUrl: S3 presigned URL
        max_retries: 최대 재시도 횟수
    
    Returns:
        업로드 결과
    """
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            logger.info(f"업로드 시도 {attempt + 1}/{max_retries + 1}")
            
            # 파일 포인터를 처음으로 되돌리기
            await file.seek(0)
            
            # 파일 내용 읽기
            file_content = await file.read()
            file_size = len(file_content)
            
            headers = {
                'Content-Type': file.content_type or 'application/octet-stream',
                'Content-Length': str(file_size),
            }
            
            # 재시도 시 더 긴 타임아웃 적용
            timeout_seconds = 300 + (attempt * 60)  # 기본 5분 + 시도마다 1분 추가
            timeout = httpx.Timeout(timeout_seconds)
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                upload_response = await client.put(
                    uploadUrl,
                    content=file_content,
                    headers=headers
                )
            
            if upload_response.status_code in [200, 201, 204]:
                logger.info(f"업로드 성공 (시도 {attempt + 1})")
                return JSONResponse(
                    status_code=200,
                    content={
                        "success": True,
                        "message": f"업로드 완료 (시도 {attempt + 1})",
                        "status": upload_response.status_code,
                        "file_size": file_size,
                        "filename": file.filename,
                        "attempts": attempt + 1
                    }
                )
            else:
                error_text = upload_response.text[:200] if upload_response.text else "No error details"
                last_error = f"HTTP {upload_response.status_code}: {error_text}"
                logger.warning(f"업로드 실패 (시도 {attempt + 1}): {last_error}")
                
        except Exception as e:
            last_error = str(e)
            logger.warning(f"업로드 에러 (시도 {attempt + 1}): {last_error}")
        
        # 마지막 시도가 아니면 잠시 대기
        if attempt < max_retries:
            wait_time = 2 ** attempt  # 지수 백오프: 1초, 2초, 4초...
            logger.info(f"{wait_time}초 후 재시도...")
            await asyncio.sleep(wait_time)
    
    # 모든 시도 실패
    logger.error(f"모든 업로드 시도 실패. 마지막 에러: {last_error}")
    raise HTTPException(
        status_code=500,
        detail=f"모든 업로드 시도 실패 ({max_retries + 1}회). 마지막 에러: {last_error}"
    )

# Lambda 핸들러
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 