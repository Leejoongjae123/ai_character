# AI 수군 변신소 프로젝트

## 📋 프로젝트 개요

**"동해를 지켜라! AI 수군 변신소"**는 사용자의 얼굴을 인식하여 조선시대 수군 캐릭터로 변신시키는 AI 기반 인터랙티브 서비스입니다. 경상좌수영성의 역사를 바탕으로 현대 기술과 전통 문화를 결합한 체험형 콘텐츠를 제공합니다.

### 🎯 주요 목표
- 역사 교육과 문화 체험의 디지털화
- AI 기술을 활용한 개인 맞춤형 캐릭터 생성
- 몰입감 있는 사용자 인터페이스 제공
- 포토카드 형태의 기념품 제작

## 🛠 기술 스택

### Frontend & Framework
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### 상태 관리 & UI
- **Zustand** (전역 상태 관리)
- **shadcn/ui** (UI 컴포넌트)
- **Radix UI** (헤드리스 컴포넌트)

### 데이터베이스 & 인증
- **Supabase** (PostgreSQL 기반)
- **Supabase Storage** (이미지 파일 저장)
- **Supabase SSR** (서버사이드 렌더링 지원)

### AI & 외부 서비스
- **AWS Lambda** (이미지 처리 API)
- **Google Cloud Speech API** (음성 인식)
- **WebRTC** (실시간 카메라 스트리밍)

### 개발 도구
- **Lottie React** (애니메이션)
- **dom-to-image-more** (DOM to Image 변환)
- **html2canvas** (캔버스 캡처)
- **react-simple-keyboard** (가상 키보드)

## 🏗 프로젝트 구조

```
102.ai_character/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── characters/           # 캐릭터 관련 API
│   │   ├── face-swap/           # 얼굴 스왑 API
│   │   ├── image/               # 이미지 처리 API
│   │   ├── upload-photo/        # 사진 업로드 API
│   │   └── ...
│   ├── camera/                   # 카메라 촬영 페이지
│   │   └── components/          # 카메라 관련 컴포넌트
│   ├── character/[id]/          # 동적 캐릭터 페이지
│   │   └── components/          # 캐릭터 상호작용 컴포넌트
│   ├── complete/                # 결과 완료 페이지
│   ├── intro/                   # 소개 페이지
│   ├── select/                  # 캐릭터 선택 페이지
│   └── components/              # 공통 컴포넌트
├── components/                   # 재사용 가능한 UI 컴포넌트
│   └── ui/                      # shadcn/ui 컴포넌트
├── utils/                       # 유틸리티 함수
│   ├── supabase/               # Supabase 클라이언트 설정
│   ├── camera.ts               # 카메라 관련 유틸
│   ├── faceSwap.ts            # 얼굴 스왑 관련 유틸
│   └── imagePolling.ts        # 이미지 폴링 유틸
└── public/                      # 정적 파일 (이미지, 사운드 등)
```

## 📊 데이터베이스 구조 (Supabase)

### 1. character 테이블
캐릭터 정보를 저장하는 메인 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| role | text | 캐릭터 역할명 |
| description | text | 캐릭터 설명 |
| ability1 | text | 첫 번째 능력명 |
| ability1_min/max | bigint | 첫 번째 능력 범위 |
| ability2 | text | 두 번째 능력명 |
| ability2_min/max | bigint | 두 번째 능력 범위 |
| images | jsonb | 캐릭터 관련 이미지 URL |
| user_id | uuid | 사용자 ID (FK) |
| name | text | 캐릭터 이름 |
| is_active | boolean | 활성화 상태 |
| usage_count | bigint | 사용 횟수 |
| last_used | timestamptz | 마지막 사용일 |
| order | bigint | 정렬 순서 |
| picture_select | text | 선택 페이지 이미지 |
| description_character_page | text | 캐릭터 페이지 설명 |
| picture_character | text | 캐릭터 상세 이미지 |
| picture_cartoon | jsonb | 만화 스타일 이미지 |
| prompt | text | AI 프롬프트 |
| star_count | bigint | 별점 개수 |

### 2. image 테이블
이미지 처리 작업을 추적하는 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| job_id | text | 작업 고유 ID |
| picture_camera | text | 촬영된 원본 이미지 URL |
| result | jsonb | AI 처리 결과 데이터 |

### 3. camera_history 테이블
카메라 촬영 이력을 저장하는 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| url | text | 촬영된 이미지 URL |

### 4. logs 테이블
사용자 활동 로그를 저장하는 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| character_id | bigint | 캐릭터 ID (FK) |
| prompt | jsonb | 사용된 프롬프트 |
| origin_image | text | 원본 이미지 URL |
| character_image | text | 변환된 캐릭터 이미지 URL |
| ability1/ability2 | text | 능력 정보 |
| ability1_min/max | bigint | 능력 범위 |
| ability2_min/max | bigint | 능력 범위 |

### 5. statistics 테이블
사용자별 통계 정보를 저장하는 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| user_id | uuid | 사용자 ID (FK) |
| total_characters | bigint | 총 생성한 캐릭터 수 |
| total_usage_count | bigint | 총 사용 횟수 |
| last_activity | timestamptz | 마지막 활동일 |
| favorite_character_id | bigint | 선호 캐릭터 ID (FK) |
| weekly_usage | jsonb | 주간 사용 통계 |
| monthly_usage | jsonb | 월간 사용 통계 |

### 6. messages 테이블
시스템 메시지를 저장하는 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 기본키 |
| created_at | timestamptz | 생성일시 |
| messages | text | 메시지 내용 |

## 🚀 주요 기능

### 1. 메인 홈페이지 (`/`)
- 프로젝트 소개 및 시작 버튼
- 배경 음악 및 인터랙티브 UI

### 2. 소개 페이지 (`/intro`)
- 경상좌수영성과 프로젝트에 대한 상세 설명
- 개인정보 수집 동의 모달
- 역사적 배경 스토리텔링

### 3. 캐릭터 선택 (`/select`)
- 12개의 조선 수군 캐릭터 카드 선택
- 각 캐릭터별 역할과 능력치 표시
- 서버사이드에서 Supabase 데이터 페칭

### 4. 캐릭터 상호작용 (`/character/[id]`)
- 선택한 캐릭터의 상세 정보 표시
- **음성 인식 기능**: Google Cloud Speech API 활용
- **키보드 입력**: 가상 키보드를 통한 상황 설정
- 사용자 맞춤형 시나리오 생성

### 5. 카메라 촬영 (`/camera`)
- **WebRTC 기반 실시간 카메라 스트리밍**
- 얼굴 가이드라인 및 촬영 지원
- 카운트다운 및 플래시 효과
- Supabase Storage를 통한 이미지 업로드

### 6. AI 이미지 처리
- **AWS Lambda API를 통한 얼굴 스왑 처리**
- 실시간 폴링을 통한 작업 상태 추적
- 백그라운드 제거 및 캐릭터 합성

### 7. 결과 완료 (`/complete`)
- **포토카드 형태의 최종 결과물 생성**
- QR 코드를 통한 이미지 공유
- 양면 인쇄 기능 (앞면: 사용자 포토카드, 뒷면: 기본 디자인)
- DOM to Image 변환을 통한 고품질 이미지 생성

## 🔌 API 엔드포인트

### 캐릭터 관련
- `GET /api/characters` - 모든 캐릭터 조회
- `GET /api/characters/[id]` - 특정 캐릭터 조회

### 이미지 처리
- `POST /api/upload-photo` - 사진 업로드 (Supabase Storage)
- `POST /api/face-swap` - 얼굴 스왑 요청 (AWS Lambda)
- `POST /api/image` - 이미지 레코드 생성 (job_id 발급)
- `GET /api/image?job_id=[id]` - 이미지 처리 상태 조회

### 기타
- `POST /api/generate-presigned-url` - 사전 서명된 업로드 URL 생성
- `GET /api/messages/random` - 랜덤 메시지 조회
- `GET /api/job-status/[jobId]` - 작업 상태 확인
- `GET /api/health-check` - 서버 상태 확인

## 🎨 디자인 및 UX 특징

### 한국 전통 테마
- 조선시대 수군을 모티브로 한 시각적 디자인
- 전통 색상 팔레트 활용 (#481F0E, #E4BE50, #F9D5AA)
- 한국 전통 폰트 사용 (MuseumClassic, DNFBitBitv2, Galmuri7)

### 반응형 인터페이스
- 대형 터치스크린 최적화 (키오스크 환경)
- 접근성을 고려한 대형 버튼 및 텍스트
- 직관적인 네비게이션 플로우

### 오디오 경험
- 배경 음악 및 효과음 지원
- 음성 인식 시 자동 배경음 음소거
- Zustand를 통한 오디오 상태 관리

## 🔧 설치 및 실행

### 환경 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Supabase 프로젝트
- AWS Lambda 함수 (이미지 처리용)
- Google Cloud Speech API 키

### 환경 변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 🏛 아키텍처 특징

### 서버 컴포넌트 우선 설계
- Next.js App Router의 서버 컴포넌트를 최대한 활용
- 클라이언트 컴포넌트는 필요한 경우에만 사용
- 데이터 페칭을 서버사이드에서 처리

### 모듈화된 컴포넌트 구조
- 각 페이지별 독립적인 components 폴더 구성
- 재사용 가능한 UI 컴포넌트 분리
- 타입 정의를 통한 타입 안전성 보장

### 에러 처리 및 사용자 경험
- 네트워크 에러에 대한 재시도 로직
- 사용자 친화적인 에러 메시지
- 로딩 상태 및 프로그레스 표시

## 🚨 보안 및 성능

### 데이터 보안
- Supabase RLS (Row Level Security) 활용
- 환경 변수를 통한 민감 정보 관리
- 클라이언트-서버 간 안전한 통신

### 성능 최적화
- Next.js Image 컴포넌트를 통한 이미지 최적화
- 코드 스플리팅 및 지연 로딩
- Supabase Storage CDN 활용

## 📝 개발 가이드라인

### 코드 스타일
- TypeScript 엄격 모드 사용
- ESLint 및 Prettier 적용
- 함수형 컴포넌트 및 React Hooks 우선 사용

### API 설계 원칙
- RESTful API 패턴 준수
- Route Handler를 통한 서버사이드 로직 구현
- 비동기 params 처리 (`await params`)

### 상태 관리
- 서버 상태는 서버 컴포넌트에서 처리
- 클라이언트 상태는 Zustand로 관리
- 전역 상태 최소화 원칙

## 🎯 향후 개선 계획

### 기능 확장
- 다중 언어 지원 (국제화)
- 소셜 미디어 공유 기능
- 사용자 계정 시스템 도입

### 기술적 개선
- PWA (Progressive Web App) 지원
- 오프라인 모드 구현
- 실시간 협업 기능

### 사용자 경험 향상
- A/B 테스트를 통한 UI/UX 최적화
- 사용자 행동 분석 도구 도입
- 접근성 표준 준수 강화

## 📞 연락처 및 지원

이 프로젝트는 문화유산 디지털화 및 AI 기술을 활용한 교육 콘텐츠 개발을 목적으로 제작되었습니다. 

### 기술 지원
- 개발 언어: 한국어
- 문서화: 한국어 우선, 영어 병행
- 코드 주석: 한국어

---

**© 2024 AI 수군 변신소 프로젝트. 모든 권리 보유.**