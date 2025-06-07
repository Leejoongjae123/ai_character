# FastAPI Lambda 이미지 업로드 서비스

Presigned URL을 이용한 이미지 업로드를 처리하는 FastAPI 기반 Lambda 서비스입니다.

## 주요 기능

- ✅ Presigned URL을 이용한 S3 업로드
- ✅ 재시도 로직 포함
- ✅ 대용량 파일 처리 최적화
- ✅ Lambda 컨테이너 이미지 지원
- ✅ CORS 설정 완료
- ✅ 상세한 로깅

## 파일 구조

```
.
├── upload.py          # FastAPI 메인 애플리케이션
├── requirements.txt   # Python 의존성
├── Dockerfile        # Lambda 컨테이너 이미지
├── deploy.sh         # AWS 배포 스크립트
├── test_local.py     # 로컬 테스트 스크립트
└── README.md         # 이 파일
```

## API 엔드포인트

### 1. 헬스체크
```
GET /
```

### 2. 기본 업로드
```
POST /upload-with-presigned
```

**Parameters:**
- `file`: 업로드할 파일 (multipart/form-data)
- `uploadUrl`: S3 presigned URL (form field)

### 3. 재시도 업로드
```
POST /upload-with-presigned-retry
```

**Parameters:**
- `file`: 업로드할 파일 (multipart/form-data)
- `uploadUrl`: S3 presigned URL (form field)
- `max_retries`: 최대 재시도 횟수 (기본값: 3)

## 로컬 개발

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 로컬 서버 실행
```bash
python test_local.py
```

서버가 실행되면:
- 서버 URL: http://localhost:8000
- API 문서: http://localhost:8000/docs

### 3. 로컬 테스트
```bash
python test_local.py test
```

## AWS Lambda 배포

### 사전 요구사항
- AWS CLI 설치 및 구성
- Docker 설치
- 적절한 AWS 권한 (ECR, Lambda, IAM)

### 배포 실행
```bash
chmod +x deploy.sh
./deploy.sh
```

배포 스크립트는 다음 작업을 수행합니다:
1. ECR 리포지토리 생성
2. Docker 이미지 빌드 및 푸시
3. Lambda 함수 생성/업데이트
4. Function URL 생성 (API Gateway 불필요)

## 사용 예시

### JavaScript/TypeScript (Next.js)
```javascript
// 기존 Next.js API 대신 Lambda 함수 사용
const uploadToLambda = async (file, uploadUrl) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadUrl', uploadUrl);
  
  const response = await fetch('YOUR_LAMBDA_FUNCTION_URL/upload-with-presigned', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};
```

### cURL
```bash
curl -X POST "YOUR_LAMBDA_FUNCTION_URL/upload-with-presigned" \
  -F "file=@image.png" \
  -F "uploadUrl=YOUR_PRESIGNED_URL"
```

## 기존 Next.js 코드 수정

현재 `app/complete/page.tsx`에서 다음 부분을 수정하세요:

```typescript
// 기존 코드
const uploadResponse = await fetch('/api/upload-with-presigned', {
  method: 'POST',
  body: formData,
});

// 수정된 코드
const uploadResponse = await fetch('YOUR_LAMBDA_FUNCTION_URL/upload-with-presigned', {
  method: 'POST',
  body: formData,
});
```

## 환경 변수

Lambda 함수에서 필요한 경우 다음 환경 변수를 설정할 수 있습니다:

- `LOG_LEVEL`: 로그 레벨 (기본값: INFO)
- `TIMEOUT_SECONDS`: 업로드 타임아웃 (기본값: 300)

## 모니터링

Lambda 함수의 로그는 CloudWatch Logs에서 확인할 수 있습니다:
- 로그 그룹: `/aws/lambda/image-upload-service`

## 비용 최적화

- Lambda 함수는 요청이 있을 때만 실행되어 비용 효율적입니다
- 메모리: 1024MB (필요에 따라 조정 가능)
- 타임아웃: 5분 (대용량 파일 처리 고려)

## 문제 해결

### 1. 업로드 실패
- CloudWatch Logs에서 상세 에러 확인
- presigned URL 유효성 검증
- 파일 크기 제한 확인

### 2. 타임아웃 에러
- Lambda 타임아웃 설정 증가
- 파일 크기 최적화 고려

### 3. CORS 에러
- Function URL CORS 설정 확인
- 브라우저 개발자 도구에서 요청 헤더 확인

## 보안 고려사항

- Function URL은 인증 없이 공개됩니다
- 필요시 API Gateway + Lambda Authorizer 사용 고려
- presigned URL 유효 시간 제한
- 파일 타입 및 크기 검증 추가 고려
