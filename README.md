# LearnTeam

팀 프로젝트에서 배운 점들을 자동으로 정리하고 포트폴리오로 변환하는 플랫폼입니다.

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 데이터베이스 설정

1. Supabase 프로젝트를 생성하세요
2. `supabase/schema.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요
3. 이렇게 하면 필요한 테이블과 RLS 정책이 생성됩니다

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/          # 인증 관련 페이지
│   │   ├── login/       # 로그인 페이지
│   │   └── signup/      # 회원가입 페이지
│   ├── api/
│   │   └── auth/        # 인증 API 엔드포인트
│   ├── dashboard/       # 대시보드 페이지
│   └── teams/           # 팀 관련 페이지
├── components/          # 재사용 가능한 컴포넌트
├── lib/                 # 유틸리티 및 설정
└── styles/              # 전역 스타일
```

## 🔐 인증 시스템

- 이메일/비밀번호 기반 인증
- React Hook Form + Zod로 폼 검증
- Supabase Auth를 사용한 세션 관리
- 미들웨어를 통한 라우트 보호

## 🗄️ 데이터베이스 스키마

주요 테이블:
- `users` - 사용자 프로필
- `teams` - 팀 정보
- `team_members` - 팀 멤버 관계
- `learning_logs` - 학습 로그
- `portfolios` - 포트폴리오
- `curated_links` - 큐레이션된 링크

자세한 스키마는 `supabase/schema.sql`을 참고하세요.

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Validation**: React Hook Form + Zod
- **Charts**: Recharts
- **Markdown**: React Markdown

## 📝 다음 단계

- [ ] 팀 생성 기능
- [ ] 학습 로그 작성 기능
- [ ] 포트폴리오 자동 생성
- [ ] 링크 큐레이션 기능
