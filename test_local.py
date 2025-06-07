#!/usr/bin/env python3
"""
로컬 테스트용 스크립트
FastAPI 서버를 로컬에서 실행하고 테스트할 수 있습니다.
"""

import asyncio
import httpx
import os
from pathlib import Path

async def test_upload():
    """업로드 테스트 함수"""
    
    # 테스트용 이미지 파일 생성 (간단한 PNG)
    test_image_path = "test_image.png"
    
    # 간단한 1x1 PNG 이미지 데이터 (base64 디코딩된 바이너리)
    png_data = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG 시그니처
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR 청크
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 크기
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # 색상 타입 등
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT 청크
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0x8E, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,  # IEND 청크
        0x42, 0x60, 0x82
    ])
    
    # 테스트 이미지 파일 생성
    with open(test_image_path, "wb") as f:
        f.write(png_data)
    
    print(f"테스트 이미지 생성: {test_image_path}")
    
    # FastAPI 서버 URL (로컬)
    base_url = "http://localhost:8000"
    
    try:
        # 헬스체크
        print("헬스체크 중...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/")
            print(f"헬스체크 응답: {response.status_code} - {response.json()}")
        
        # 업로드 테스트 (가짜 presigned URL 사용)
        print("\n업로드 테스트 중...")
        fake_presigned_url = "https://httpbin.org/put"  # 테스트용 URL
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            with open(test_image_path, "rb") as f:
                files = {"file": ("test_image.png", f, "image/png")}
                data = {"uploadUrl": fake_presigned_url}
                
                response = await client.post(
                    f"{base_url}/upload-with-presigned",
                    files=files,
                    data=data
                )
                
                print(f"업로드 응답 상태: {response.status_code}")
                print(f"업로드 응답 내용: {response.json()}")
        
        # 재시도 테스트
        print("\n재시도 업로드 테스트 중...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            with open(test_image_path, "rb") as f:
                files = {"file": ("test_image.png", f, "image/png")}
                data = {
                    "uploadUrl": fake_presigned_url,
                    "max_retries": "2"
                }
                
                response = await client.post(
                    f"{base_url}/upload-with-presigned-retry",
                    files=files,
                    data=data
                )
                
                print(f"재시도 업로드 응답 상태: {response.status_code}")
                print(f"재시도 업로드 응답 내용: {response.json()}")
                
    except Exception as e:
        print(f"테스트 중 오류 발생: {e}")
    
    finally:
        # 테스트 파일 정리
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"\n테스트 파일 삭제: {test_image_path}")

def run_server():
    """FastAPI 서버 실행"""
    import uvicorn
    from upload import app
    
    print("FastAPI 서버 시작 중...")
    print("서버 URL: http://localhost:8000")
    print("API 문서: http://localhost:8000/docs")
    print("Ctrl+C로 서버 종료")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # 테스트 실행
        print("업로드 API 테스트 시작...")
        asyncio.run(test_upload())
    else:
        # 서버 실행
        run_server() 