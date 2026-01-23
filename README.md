# LearnTeam

팀 프로젝트에서 배운 점들을 자동으로 정리하고 포트폴리오로 변환하는 플랫폼입니다. 개인 학습 기록을 관리하고, 팀과 협업하며, 자동으로 포트폴리오를 생성할 수 있습니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [데이터베이스 설정](#데이터베이스-설정)
- [API 엔드포인트](#api-엔드포인트)
- [배포](#배포)
- [알려진 이슈 및 개선 사항](#알려진-이슈-및-개선-사항)
- [기여하기](#기여하기)

## ✨ 주요 기능

### ✅ 구현 완료

1. **사용자 인증**
   - 이메일/비밀번호 기반 회원가입 및 로그인
   - 이메일 인증 (선택적)
   - 세션 관리 및 자동 로그아웃
   - 미들웨어를 통한 라우트 보호

2. **개인 학습 로그**
   - 날짜별 학습 내용 기록
   - 태그 시스템
   - 학습 로그 CRUD (생성, 조회, 수정, 삭제)
   - 학습 통계 자동 계산 (총 로그 수, 학습 일수, 일평균 등)

3. **개인 포트폴리오**
   - 자기소개 작성
   - 기술 스택 관리
   - 주요 성과 기록
   - 공개/비공개 설정
   - 고유 URL 생성 (`/profile/[slug]`)
   - 학습 로그 기반 통계 자동 표시
   - 최근 학습 기록 표시

4. **대시보드**
   - 개인 학습 로그 작성 및 미리보기
   - 최근 활동 피드
   - 통계 요약

### 🚧 부분 구현

1. **팀 기능**
   - 팀 생성 (기본 구현 완료)
   - 팀 멤버 관리 (초대, 역할 설정)
   - 팀 학습 로그 (기본 구조만 존재)
   - 팀 포트폴리오 (기본 구조만 존재)

### 📝 향후 구현 예정

1. **팀 협업 기능**
   - 팀 학습 로그 공유 및 피드백
   - 팀 포트폴리오 자동 생성
   - 팀 통계 및 분석

2. **글 큐레이션**
   - 유용한 아티클/비디오 공유
   - 태그 기반 분류
   - 팀 내 공유

3. **고급 기능**
   - 실시간 알림
   - 검색 기능
   - 필터링 및 정렬
   - 데이터 내보내기 (PDF, Markdown)

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.460.0
- **Form Management**: React Hook Form 7.50.1
- **Form Validation**: Zod 3.22.4
- **Charts**: Recharts 2.12.0
- **Markdown**: React Markdown 9.0.1

### 백엔드
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **ORM**: Prisma 7.3.0 (선택적, 현재 미사용)

### 개발 도구
- **Linting**: ESLint 9.0.0
- **Package Manager**: npm
- **Bundler**: Webpack (Turbopack 비활성화)

## 📁 프로젝트 구조

```
LearnTeam/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 관련 페이지
│   │   │   ├── login/                # 로그인 페이지
│   │   │   ├── signup/               # 회원가입 페이지
│   │   │   └── verify-email/        # 이메일 인증 페이지
│   │   ├── api/                      # API 라우트
│   │   │   ├── auth/                 # 인증 API
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   ├── verify-email/
│   │   │   │   └── resend-verification/
│   │   │   ├── logs/                 # 개인 학습 로그 API
│   │   │   ├── learning-logs/        # 학습 로그 통계 API
│   │   │   │   └── summary/
│   │   │   ├── profile/              # 개인 포트폴리오 API
│   │   │   │   └── portfolio/
│   │   │   │       ├── route.ts      # GET, PUT
│   │   │   │       └── [slug]/       # GET (공개 포트폴리오)
│   │   │   ├── portfolio/            # 팀 포트폴리오 API (기존)
│   │   │   │   └── [portfolioId]/
│   │   │   └── teams/                # 팀 API
│   │   │       ├── route.ts          # GET, POST
│   │   │       └── [teamId]/
│   │   ├── dashboard/                # 대시보드 페이지
│   │   ├── logs/                     # 학습 로그 목록 페이지
│   │   ├── portfolio/                # 개인 포트폴리오 페이지
│   │   │   ├── page.tsx              # 내 포트폴리오 보기
│   │   │   ├── edit/                 # 포트폴리오 수정
│   │   │   └── [portfolioId]/        # 팀 포트폴리오 (기존)
│   │   ├── profile/                  # 공개 포트폴리오 페이지
│   │   │   └── [slug]/               # 공개 포트폴리오 보기
│   │   ├── teams/                    # 팀 관련 페이지
│   │   │   ├── [teamId]/
│   │   │   │   ├── page.tsx          # 팀 상세
│   │   │   │   ├── logs/             # 팀 로그
│   │   │   │   ├── members/          # 팀 멤버
│   │   │   │   ├── portfolio/        # 팀 포트폴리오
│   │   │   │   └── settings/         # 팀 설정
│   │   │   └── join/                 # 팀 가입
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 랜딩 페이지
│   │   └── globals.css               # 전역 스타일
│   ├── components/                   # 재사용 가능한 컴포넌트
│   │   ├── ActivityFeed.tsx          # 활동 피드
│   │   ├── CreateTeamModal.tsx       # 팀 생성 모달
│   │   ├── DashboardStats.tsx        # 대시보드 통계
│   │   ├── LearningLogForm.tsx       # 학습 로그 폼
│   │   ├── LogoutButton.tsx          # 로그아웃 버튼
│   │   ├── Navbar.tsx                # 네비게이션 바
│   │   ├── PersonalLearningLogForm.tsx  # 개인 학습 로그 폼
│   │   ├── PersonalLearningLogSection.tsx  # 개인 학습 로그 섹션
│   │   ├── ProtectedRoute.tsx        # 보호된 라우트
│   │   ├── Sidebar.tsx               # 사이드바
│   │   └── TeamCard.tsx              # 팀 카드
│   ├── lib/                          # 유틸리티 및 설정
│   │   ├── supabase/
│   │   │   ├── client.ts             # 클라이언트 Supabase 클라이언트
│   │   │   ├── server.ts             # 서버 Supabase 클라이언트
│   │   │   └── middleware.ts         # 미들웨어용 클라이언트
│   │   └── types.ts                  # 공통 타입 정의
│   └── types/                        # 타입 정의
│       ├── learning-log.ts           # 학습 로그 타입
│       ├── portfolio.ts               # 포트폴리오 타입
│       ├── next.d.ts                  # Next.js 타입 선언
│       └── react-markdown.d.ts       # React Markdown 타입 선언
├── supabase/                         # Supabase SQL 스크립트
│   ├── schema.sql                    # 기본 스키마 (팀 기능)
│   ├── create_personal_learning_logs_simple.sql  # 개인 학습 로그 테이블
│   ├── create_personal_portfolio.sql # 개인 포트폴리오 테이블
│   └── ...                           # 기타 마이그레이션 파일
├── middleware.ts                     # Next.js 미들웨어 (라우트 보호)
├── next.config.js                    # Next.js 설정
├── tailwind.config.ts                # Tailwind CSS 설정
├── tsconfig.json                     # TypeScript 설정
├── eslint.config.mjs                 # ESLint 설정 (Flat Config)
├── package.json                      # 프로젝트 의존성
└── .npmrc                            # npm 설정 (legacy-peer-deps)
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd LearnTeam
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 앱 설정 (선택사항)
NEXT_PUBLIC_APP_URL=http://localhost:3000
REQUIRE_EMAIL_CONFIRMATION=false  # 개발 환경에서는 false 권장
```

환경 변수는 `env.example` 파일을 참고하세요.

### 3. 의존성 설치

```bash
npm install
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Supabase 대시보드 → SQL Editor로 이동
3. 다음 SQL 파일들을 순서대로 실행:
   - `supabase/schema.sql` - 기본 스키마 (팀 기능)
   - `supabase/create_personal_learning_logs_simple.sql` - 개인 학습 로그 테이블
   - `supabase/create_personal_portfolio.sql` - 개인 포트폴리오 테이블

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 6. 빌드 (프로덕션)

```bash
npm run build
npm start
```

## 🗄️ 데이터베이스 설정

### 주요 테이블

#### 개인 기능
- **`personal_learning_logs`**: 개인 학습 로그
  - `id`, `user_id`, `content`, `log_date`, `tags`, `created_at`, `updated_at`

- **`personal_portfolios`**: 개인 포트폴리오
  - `id`, `user_id`, `bio`, `skills`, `achievements`, `is_public`, `portfolio_slug`, `created_at`, `updated_at`

#### 팀 기능
- **`users`**: 사용자 프로필
- **`teams`**: 팀 정보
- **`team_members`**: 팀 멤버 관계
- **`learning_logs`**: 팀 학습 로그
- **`portfolios`**: 팀 포트폴리오
- **`curated_links`**: 큐레이션된 링크

### Row Level Security (RLS)

모든 테이블에 RLS가 활성화되어 있으며, 다음 정책이 적용됩니다:

- **개인 데이터**: 사용자는 자신의 데이터만 조회/수정 가능
- **공개 포트폴리오**: `is_public=true`인 포트폴리오는 누구나 조회 가능
- **팀 데이터**: 팀 멤버만 해당 팀의 데이터에 접근 가능

자세한 RLS 정책은 각 SQL 파일을 참고하세요.

## 📡 API 엔드포인트

### 인증 API

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보
- `GET /api/auth/verify-email` - 이메일 인증 확인
- `POST /api/auth/resend-verification` - 인증 이메일 재전송

### 개인 학습 로그 API

- `GET /api/logs` - 사용자의 모든 학습 로그 조회
- `POST /api/logs` - 새 학습 로그 생성
- `GET /api/learning-logs/summary` - 학습 로그 통계 조회

### 개인 포트폴리오 API

- `GET /api/profile/portfolio` - 내 포트폴리오 조회
- `PUT /api/profile/portfolio` - 포트폴리오 생성/수정
- `GET /api/profile/portfolio/[slug]` - 공개 포트폴리오 조회

### 팀 API

- `GET /api/teams` - 사용자가 속한 팀 목록 조회
- `POST /api/teams` - 새 팀 생성
- `GET /api/teams/[teamId]` - 팀 상세 정보 조회
- `PUT /api/teams/[teamId]` - 팀 정보 수정
- `DELETE /api/teams/[teamId]` - 팀 삭제
- `POST /api/teams/[teamId]/invite` - 팀 멤버 초대
- `GET /api/teams/[teamId]/logs` - 팀 학습 로그 조회
- `POST /api/teams/[teamId]/logs` - 팀 학습 로그 생성

## 🚢 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 프로젝트 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. 빌드 명령: `npm run build`
4. 배포

### 환경 변수 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되므로 `NEXT_PUBLIC_` 접두사 없이 설정
- 프로덕션 환경에서는 `REQUIRE_EMAIL_CONFIRMATION=true`로 설정 권장

## ⚠️ 알려진 이슈 및 개선 사항

### 현재 이슈

1. **Turbopack 호환성 문제**
   - Windows에서 한글 경로가 포함된 경우 Turbopack 오류 발생
   - **해결책**: `npm run dev`에서 `--webpack` 플래그 사용 (현재 적용됨)

2. **Next.js 16 호환성**
   - `cookies()` API가 Promise를 반환하므로 `await` 필요
   - 동적 라우트의 `params`가 Promise로 변경됨
   - **해결책**: 모든 API 라우트에서 `await params` 사용 (적용 완료)

3. **React 19 Peer Dependency 경고**
   - 일부 패키지가 React 19를 완전히 지원하지 않음
   - **해결책**: `package.json`에 `overrides` 추가 및 `.npmrc` 설정 (적용 완료)

### 개선 필요 사항

#### 높은 우선순위

1. **팀 기능 완성**
   - [ ] 팀 학습 로그 CRUD 완전 구현
   - [ ] 팀 멤버 초대/제거 기능 개선
   - [ ] 팀 포트폴리오 자동 생성 기능
   - [ ] 팀 통계 및 분석 대시보드

2. **에러 처리 개선**
   - [ ] 전역 에러 바운더리 추가
   - [ ] API 에러 메시지 표준화
   - [ ] 사용자 친화적인 에러 메시지

3. **성능 최적화**
   - [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
   - [ ] API 응답 캐싱
   - [ ] 데이터베이스 쿼리 최적화

#### 중간 우선순위

4. **UI/UX 개선**
   - [ ] 반응형 디자인 개선 (모바일 최적화)
   - [ ] 로딩 상태 개선 (스켈레톤 UI)
   - [ ] 다크 모드 지원
   - [ ] 접근성 개선 (ARIA 라벨, 키보드 네비게이션)

5. **기능 추가**
   - [ ] 학습 로그 검색 및 필터링
   - [ ] 학습 로그 내보내기 (PDF, Markdown)
   - [ ] 실시간 알림 시스템
   - [ ] 글 큐레이션 기능

6. **테스트**
   - [ ] 단위 테스트 작성 (Jest, React Testing Library)
   - [ ] 통합 테스트 작성
   - [ ] E2E 테스트 작성 (Playwright)

#### 낮은 우선순위

7. **문서화**
   - [ ] API 문서 자동 생성 (Swagger/OpenAPI)
   - [ ] 컴포넌트 스토리북 작성
   - [ ] 사용자 가이드 작성

8. **국제화**
   - [ ] 다국어 지원 (i18n)
   - [ ] 날짜/시간 포맷 지역화

## 🔧 개발 가이드

### 코드 스타일

- TypeScript strict 모드 사용
- ESLint 규칙 준수
- Prettier 포맷팅 (설정 필요 시)

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정, 패키지 매니저 설정 등
```

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- 그리고 모든 오픈소스 기여자들께 감사드립니다.

---

**참고**: 이 프로젝트는 현재 MVP 단계이며, 지속적으로 개선되고 있습니다. 버그를 발견하거나 개선 사항이 있으시면 이슈를 생성해주세요!
