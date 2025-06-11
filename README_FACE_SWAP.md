# 얼굴 스왑 기능 구현 가이드

## 개요
카메라를 통해 촬영한 사용자의 얼굴과 캐릭터 이미지를 FastAPI 서버를 통해 얼굴 스왑하는 기능을 구현했습니다.

## 주요 기능
1. **카메라 촬영**: 웹캠을 통한 실시간 사진 촬영
2. **이미지 업로드**: Supabase Storage에 촬영된 사진 업로드
3. **얼굴 스왑 요청**: FastAPI 서버에 얼굴 스왑 작업 요청
4. **작업 상태 폴링**: 비동기 작업 진행 상황 실시간 확인
5. **결과 표시**: 완성된 얼굴 스왑 이미지를 완료 페이지에 표시

## 아키텍처

### 프론트엔드 (Next.js)
- **카메라 페이지**: `/app/camera/page.tsx`
- **완료 페이지**: `/app/complete/page.tsx`
- **API 라우트**: 
  - `/app/api/face-swap/route.ts` - 얼굴 스왑 요청
  - `/app/api/job-status/[jobId]/route.ts` - 작업 상태 확인

### 백엔드 (FastAPI)
- **얼굴 스왑 엔드포인트**: `POST /face-swap-with-cartoon`
- **작업 상태 확인**: `GET /job/{job_id}`

## 흐름도

```
1. 사용자 사진 촬영
   ↓
2. Supabase Storage에 업로드
   ↓
3. FastAPI 서버에 얼굴 스왑 요청
   - 사용자 이미지 URL
   - 캐릭터 이미지 URL (https://www.ulsanai.kr/result/result{캐릭터번호}.webp)
   ↓
4. job_id 반환
   ↓
5. 폴링으로 작업 상태 확인 (5초 간격)
   ↓
6. 작업 완료 시 결과 이미지 URL 획득
   ↓
7. 완료 페이지에서 결과 이미지 표시
```

## 컴포넌트 구조

### 카메라 페이지
```
app/camera/
├── page.tsx                 # 메인 페이지
├── types.ts                 # 타입 정의
└── components/
    ├── WebcamComponent.tsx  # 웹캠 컴포넌트
    ├── CameraCorners.tsx    # 카메라 모서리 장식
    └── ProcessingStatus.tsx # 처리 상태 표시
```

### 유틸리티
```
utils/
├── camera.ts               # 카메라 관련 유틸리티
└── faceSwap.ts            # 얼굴 스왑 API 호출 함수
```

## API 사용법

### 1. 얼굴 스왑 요청
```typescript
const faceSwapResult = await requestFaceSwap(faceImageUrl, characterId);
```

### 2. 작업 상태 폴링
```typescript
const finalResult = await pollJobStatus(
  jobId,
  (status) => {
    // 진행 상황 업데이트 콜백
    console.log(status.message);
  }
);
```

## 환경 설정

### 필수 환경 변수
```env
# FastAPI 서버 URL (기본값: http://localhost:8000)
NEXT_PUBLIC_FASTAPI_SERVER_URL=http://localhost:8000

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### FastAPI 서버 실행
FastAPI 서버는 별도로 실행되어야 합니다. 서버가 포트 8000에서 실행 중인지 확인하세요.

## 주요 특징

### 1. 컴포넌트 분리
- 기능별로 컴포넌트를 분리하여 재사용성과 유지보수성 향상
- 타입 정의를 별도 파일로 분리

### 2. 에러 처리
- 각 단계별 에러 처리 및 사용자 피드백
- Toast 메시지를 통한 상태 알림

### 3. 비동기 처리
- 얼굴 스왑 작업은 백그라운드에서 비동기 처리
- 폴링을 통한 실시간 상태 확인

### 4. 사용자 경험
- Lottie 애니메이션을 통한 로딩 표시
- 처리 단계별 메시지 표시
- 카운트다운 및 플래시 효과

## 트러블슈팅

### 1. FastAPI 서버 연결 실패
- FastAPI 서버가 실행 중인지 확인
- CORS 설정이 올바른지 확인

### 2. 이미지 업로드 실패
- Supabase Storage 권한 확인
- 이미지 파일 크기 제한 확인

### 3. 작업 시간 초과
- 최대 5분 (300초) 대기 후 타임아웃
- 네트워크 상태 및 서버 부하 확인

## 향후 개선사항

1. **이미지 품질 최적화**: 압축 및 리사이징
2. **캐시 시스템**: 중복 작업 방지
3. **진행률 표시**: 더 세분화된 진행 상황 표시
4. **오프라인 모드**: 네트워크 오류 시 재시도 로직 