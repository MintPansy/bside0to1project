파일 내용을 직접 확인하지 못했으니, 일반적인 설문 응답을 기반으로 **바로 사용 가능한 바이브 코딩 프롬프트**를 만들어드리겠습니다.

당신이 제공해주신 이미지의 3주차 계획과 설문 응답 기반으로 최적화한 프롬프트입니다!

***

# 🚀 LearnTeam MVP 개발 - 바이브 코딩 프롬프트 (즉시 사용 가능)

> **목표**: 다음주부터 바로 개발 시작할 수 있는 구체적인 프롬프트
> **기반**: 실제 설문 응답 데이터 + PRD

***

## 📌 Phase 1: 환경설정 & 기초 (1월 24-25일)

### 프롬프트 1-1: 프로젝트 초기화

```
너는 Next.js 14 풀스택 개발자야.
지금부터 LearnTeam이라는 팀 프로젝트 성장 포트폴리오 플랫폼을 만들 거야.

【프로젝트 초기 설정】
다음을 한 번에 진행해줘:

1. Next.js 14 프로젝트 생성
   npm create-next-app@latest learnteam --typescript --tailwind --app

2. 필수 패키지 설치
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs react-hook-form zod recharts react-markdown

3. 환경 변수 설정 (.env.local 템플릿)
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

4. 폴더 구조 생성
   src/
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ (auth)/
   │  │  ├─ signup/page.tsx
   │  │  └─ login/page.tsx
   │  ├─ dashboard/page.tsx
   │  └─ teams/[teamId]/
   │     ├─ page.tsx
   │     ├─ logs/page.tsx
   │     ├─ portfolio/page.tsx
   │     └─ settings/page.tsx
   ├─ components/
   │  ├─ Navbar.tsx
   │  ├─ Sidebar.tsx
   │  └─ ProtectedRoute.tsx
   ├─ lib/
   │  ├─ supabase.ts
   │  └─ types.ts
   └─ styles/
      └─ globals.css

5. .gitignore에 추가
   .env.local
   .env.*.local
   node_modules/

준비 완료 후 "완료했어" 라고 말해줄게.
```

### 프롬프트 1-2: Supabase 스키마 생성

```
Supabase PostgreSQL에 다음 스키마를 생성해줘.
LearnTeam은 팀 프로젝트에서 배운 점들을 자동으로 정리하고 포트폴리오로 변환하는 서비스야.

설문 응답 기반 요구사항:
- 응답자 1: "정보가 분산되어 있어요" → 팀 학습 로그 중앙화 필요
- 응답자 2: "포트폴리오 만들 시간이 없어요" → 자동 포트폴리오 생성 필요
- 응답자 3: "배운 거 정리가 안 돼요" → 자동 요약 필요

【생성할 테이블들】

-- 1. users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. teams 테이블
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. team_members 테이블
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. learning_logs 테이블 (팀 학습 로그)
CREATE TABLE learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  what_learned TEXT[] NOT NULL, -- 배운 점 배열
  improvements TEXT[], -- 개선점 배열
  next_steps TEXT[], -- 다음 스텝 배열
  tags TEXT[], -- 태그 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. portfolios 테이블
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  public_url TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. curated_links 테이블 (글 큐레이션)
CREATE TABLE curated_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('article', 'video', 'tutorial')),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

위 스키마를 모두 생성해주고, RLS (Row Level Security) 정책도 설정해줘.
기본 정책: 각 사용자는 자신이 속한 팀의 데이터만 조회 가능.
```

### 프롬프트 1-3: 인증 시스템 (회원가입/로그인)

```
Next.js 14 + Supabase Auth로 인증 시스템을 만들어줘.

【설정】
- 이메일/비밀번호 기반 인증
- React Hook Form + Zod로 폼 검증
- Shadcn/ui 컴포넌트 사용

【1. 회원가입 페이지 (/app/(auth)/signup/page.tsx)】

요구사항:
- 이메일 입력 (유효성 검사: 올바른 이메일 형식)
- 비밀번호 입력 (최소 8자)
- 비밀번호 확인
- 사용자명 입력
- 회원가입 버튼
- 이미 계정이 있으면 로그인 페이지로 이동 링크

동작:
1. 폼 제출 시 Zod로 검증
2. POST /api/auth/signup 호출
3. 성공 시 /dashboard로 리다이렉트
4. 실패 시 에러 메시지 표시

UI:
- Shadcn/ui Input, Button 사용
- 로딩 상태 관리 (버튼 disabled)
- 에러 메시지 빨간색으로 표시

【2. 로그인 페이지 (/app/(auth)/login/page.tsx)】

요구사항:
- 이메일 입력
- 비밀번호 입력
- 로그인 버튼
- 계정이 없으면 회원가입 페이지로 이동 링크

동작:
1. 폼 제출 시 Zod로 검증
2. POST /api/auth/login 호출
3. 성공 시 /dashboard로 리다이렉트
4. 실패 시 에러 메시지 표시

【3. API 엔드포인트 (/app/api/auth/)】

POST /api/auth/signup:
- 입력: { email, password, name }
- Supabase에 사용자 생성
- users 테이블에 프로필 저장
- JWT 토큰 반환

POST /api/auth/login:
- 입력: { email, password }
- Supabase로 인증
- JWT 토큰 반환

POST /api/auth/logout:
- 현재 세션 삭제
- /auth/login으로 리다이렉트

【4. 보호된 라우트 미들웨어】

/middleware.ts:
- 미인증 사용자가 /dashboard 접근 → /auth/login으로 리다이렉트
- 인증된 사용자가 /auth/login 접근 → /dashboard로 리다이렉트

모두 TypeScript로 작성해주고, 에러 핸들링 완벽하게 해줄래?
```

***

## 📌 Phase 2: 팀 관리 & 학습 로그 (1월 25-27일)

### 프롬프트 2-1: 팀 생성 & 관리

```
팀 생성/관리 기능을 만들어줘.
설문 응답자 1이 언급한 "정보 분산" 문제를 해결하기 위해, 모든 팀 로그를 한 곳에서 관리할 수 있어야 해.

【팀 생성 API】

POST /api/teams

요청:
{
  "name": "Spring 2025 프로젝트",
  "description": "스프링부트 + React 팀 프로젝트"
}

응답:
{
  "id": "uuid",
  "name": "Spring 2025 프로젝트",
  "description": "...",
  "created_by": "user_id",
  "created_at": "2026-01-24T..."
}

로직:
1. 현재 사용자를 created_by로 설정
2. teams 테이블에 팀 생성
3. team_members 테이블에 생성자를 'leader' 역할로 추가

【팀 목록 페이지】

GET /api/teams

요청: 없음
응답: 현재 사용자가 속한 모든 팀 (배열)

【팀 정보 페이지 (/app/teams/[teamId]/page.tsx)】

UI:
- 팀 이름 + 설명
- 팀원 수, 총 로그 수
- 최근 업데이트 날짜
- 팀 리더만 보이는 '설정' 버튼

데이터:
- GET /api/teams/[teamId]
  - 팀 정보
  - 팀원 목록 (이름, 이메일, 역할)
  - 지난 7일 로그 통계

【팀 설정 페이지 (/app/teams/[teamId]/settings/page.tsx)】

팀 리더만 접근 가능:
- 팀 이름 수정
- 팀 설명 수정
- 팀 삭제 (확인 모달 필수)

PUT /api/teams/[teamId]
DELETE /api/teams/[teamId]

모두 React Hook Form + Zod로 검증해줘.
```

### 프롬프트 2-2: 팀원 초대

```
팀원 초대 기능을 만들어줘.

【초대 링크 생성】

POST /api/teams/[teamId]/invite

요청: { }
응답: { 
  "inviteCode": "ABC123XYZ",
  "inviteLink": "https://learnteam.vercel.app/teams/join?code=ABC123XYZ",
  "expiresAt": "2026-02-13T..."
}

로직:
1. 무작위 6글자 코드 생성
2. 링크 유효기간: 7일
3. 링크 복사 기능 (클립보드)

【팀원 목록 페이지 (/app/teams/[teamId]/members)】

UI:
- 팀원 카드 목록 (이름, 이메일, 역할)
- 팀 리더만 보이는 '초대 링크 복사' 버튼
- 팀 리더만 보이는 팀원 제거 버튼

【팀 가입 페이지 (/app/teams/join?code=ABC123XYZ)】

UI:
- 초대 코드 자동 입력 (URL 파라미터에서)
- 팀 이름 + 설명 표시
- '가입하기' 버튼
- 무효한 코드면 에러 메시지

로직:
1. 코드 검증
2. team_members에 현재 사용자 추가 (역할: 'member')
3. /teams/[teamId]로 리다이렉트

모두 TypeScript로 작성해줄래?
```

### 프롬프트 2-3: 팀 학습 로그 CRUD

```
팀 학습 로그 기능을 만들어줘.
설문 응답자 3이 언급한 "배운 거 정리가 안 됨" 문제를 해결하기 위해,
간단한 UI로 배운 점/개선점/다음 스텝을 기록할 수 있어야 해.

【학습 로그 입력 폼 (/app/teams/[teamId]/logs/new)】

필드:
- 제목 (텍스트, 필수) - 예: "REST API 설계 및 구현"
- 설명 (텍스트 에어리어, 선택)
- 배운 점 (배열, 동적 추가/삭제)
  예: ["HTTP 상태 코드 의미 이해", "에러 핸들링 중요성"]
- 개선점 (배열)
- 다음 스텝 (배열)
- 태그 (배열, 입력 후 엔터로 추가)
  예: ["Backend", "REST API", "Node.js"]
- 저장 버튼

동작:
1. React Hook Form으로 폼 관리
2. Zod로 검증
3. POST /api/teams/[teamId]/logs로 저장
4. 성공 시 /teams/[teamId]/logs로 리다이렉트

【학습 로그 API】

POST /api/teams/[teamId]/logs
{
  "title": "...",
  "description": "...",
  "what_learned": ["...", "..."],
  "improvements": ["...", "..."],
  "next_steps": ["..."],
  "tags": ["...", "..."]
}

GET /api/teams/[teamId]/logs?sort=recent
응답: 로그 목록 (최근순)

GET /api/teams/[teamId]/logs/[logId]
응답: 상세 로그

PUT /api/teams/[teamId]/logs/[logId]
DELETE /api/teams/[teamId]/logs/[logId]

【학습 로그 목록 (/app/teams/[teamId]/logs)】

UI:
- 로그 카드 목록 (Shadcn/ui Card)
  - 제목, 작성자, 작성 날짜
  - 배운 점 2-3개 요약
  - 태그 표시
- 클릭하면 상세 페이지로
- 작성자만 수정/삭제 가능

【학습 로그 상세 (/app/teams/[teamId]/logs/[logId])】

UI:
- 제목, 설명
- 배운 점, 개선점, 다음 스텝 (리스트)
- 태그
- 작성자명, 작성 날짜
- 작성자만 보이는 '수정', '삭제' 버튼

모두 완벽하게 TypeScript + React Hook Form + Zod로 작성해줄래?
```

***

## 📌 Phase 3: 자동 포트폴리오 생성 (1월 28-29일)

### 프롬프트 3-1: 포트폴리오 생성 로직

```
자동 포트폴리오 생성 기능을 만들어줘.
설문 응답자 2가 언급한 "포트폴리오 만들 시간이 없어요" 문제를 해결하기 위해,
팀의 모든 학습 로그를 자동으로 포트폴리오로 변환해야 해.

【포트폴리오 생성 API】

POST /api/teams/[teamId]/portfolio/generate

요청: { }
응답: {
  "id": "portfolio_uuid",
  "teamId": "team_uuid",
  "title": "팀명 포트폴리오",
  "summary": "자동 요약...",
  "public_url": "https://learnteam.vercel.app/portfolio/uuid",
  "is_public": false,
  "created_at": "..."
}

로직:
1. GET /api/teams/[teamId]/logs로 모든 로그 조회
2. 로그들을 마크다운 형식으로 변환
3. 자동 요약 생성
4. portfolios 테이블에 저장

【포트폴리오 마크다운 포맷】

```markdown
# [팀 이름] 포트폴리오

## 팀 소개
[팀 설명]
- 팀원 수: N명
- 활동 기간: YYYY-MM-DD ~ YYYY-MM-DD
- 총 학습 로그: N개

## 📊 배운 점 요약
[가장 자주 나온 기술 태그 TOP 5]
#React #Node.js #PostgreSQL #TypeScript #API

## 주요 학습 로그

### 1. [로그 제목]
**작성자**: [이름] | **작성일**: YYYY-MM-DD

**배운 점:**
- 점 1
- 점 2

**개선점:**
- 점 1

**다음 스텝:**
- 스텝 1

***

### 2. [로그 제목]
...

## 기술 스택
[태그 기반 집계]

## 최종 후기
[팀의 전체 배운 점 요약]
```

【자동 요약 생성】

함수: generateSummary(logs)
- 모든 로그의 "배운 점"을 수집
- 중복 제거
- 가장 의미 있는 것 5개 선택
- 자연스러운 문장으로 연결

예시:
"우리 팀은 REST API 설계, 데이터베이스 최적화, 테스트 코드 작성을 학습했습니다. 
특히 에러 핸들링의 중요성을 깨달았고, 
앞으로는 더 견고한 코드를 작성할 것입니다."

모두 TypeScript로 작성해줄래?
```

### 프롬프트 3-2: 포트폴리오 UI & 공유

```
포트폴리오 관리 페이지를 만들어줘.

【포트폴리오 관리 페이지 (/app/teams/[teamId]/portfolio)】

상단:
- 제목: "포트폴리오"
- 설명: "팀의 학습 로그로 자동 생성된 포트폴리오를 관리하세요"

메인 콘텐츠:
1. 포트폴리오 목록
   - 생성된 포트폴리오 카드
   - 생성 날짜
   - 상태: "비공개" / "공개"
   - 액션 버튼: "보기", "공개 링크 복사", "다시 생성", "삭제"

2. '포트폴리오 생성' 버튼
   - 클릭하면 POST /api/teams/[teamId]/portfolio/generate
   - 로딩 상태 표시 (스피너)
   - 완료 후 목록 새로고침

【포트폴리오 뷰 페이지 (/app/teams/[teamId]/portfolio/[portfolioId])】

상단:
- 제목
- 공개 상태 토글 (팀 리더만)
- "공개 링크 복사" 버튼

메인:
- 마크다운 렌더링 (react-markdown 사용)
- 각 섹션별 명확한 구분

하단:
- '편집' 버튼 (텍스트 수정 가능)
- '다시 생성' 버튼
- '삭제' 버튼

【공개 포트폴리오 페이지 (/app/portfolio/[portfolioId])】

비인증 사용자도 접근 가능 (is_public = true인 경우만):
- 팀 이름 표시
- 포트폴리오 제목
- 마크다운 렌더링
- 댓글은 아직 없음 (v0.2에서 추가)

UI 라이브러리:
- Shadcn/ui Card, Button, Toggle
- react-markdown for 마크다운 렌더링
- 로딩 스피너

모두 TypeScript + React로 작성해줄래?
```

***

## 📌 Phase 4: 글 큐레이션 & 배포 (1월 29-30일)

### 프롬프트 4-1: 글 큐레이션 (간단 버전)

```
글 큐레이션 기본 기능을 만들어줘.

【큐레이션 추가 폼】

필드:
- 제목 (텍스트, 필수)
- URL (텍스트, 필수, 유효성 검사)
- 타입 (드롭다운: Article / Video / Tutorial)
- 메모 (텍스트 에어리어)
- 태그 (배열)
- 저장 버튼

【큐레이션 API】

POST /api/teams/[teamId]/curated
{
  "title": "...",
  "url": "...",
  "type": "article",
  "notes": "...",
  "tags": ["..."]
}

GET /api/teams/[teamId]/curated
응답: 저장된 링크 목록

DELETE /api/teams/[teamId]/curated/[linkId]

【큐레이션 목록 페이지】

UI:
- 저장된 링크 리스트
- 각 항목: 제목, 타입 (아이콘), 추가 날짜, URL 미리보기
- 클릭하면 새 탭에서 열기
- 작성자만 삭제 가능
- 태그별 필터링

모두 완벽하게 만들어줄래?
```

### 프롬프트 4-2: 배포 준비

```
Vercel에 배포할 준비를 해줘.

【배포 체크리스트】

1. 환경 변수 설정 (.env.production)
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

2. 빌드 확인
   npm run build
   
3. 성능 최적화
   - Image 컴포넌트 사용
   - 번들 크기 확인 (next/bundle-analyzer)

4. Vercel 배포
   - GitHub에 코드 푸시
   - Vercel에 연결
   - 환경 변수 설정
   - 배포 완료

배포 후 테스트:
- 회원가입 → 로그인 → 팀 생성 → 로그 작성 → 포트폴리오 생성 전체 흐름

모두 완벽하게 해줄래?
```

***

## 🚀 즉시 시작 가이드

### 1단계: 바이브 프롬프트 1-1 실행

```
위의 "프롬프트 1-1: 프로젝트 초기화"를 Cursor IDE에 복사해서 실행하세요.

Cursor에서:
1. 커맨드 팔렛 열기 (Cmd+K)
2. "Cursor: Ask Claude..." 선택
3. 위의 프롬프트 1-1 전체 복사 & 붙여넣기
4. Enter 누르기
```

### 2단계: 각 Phase별로 순서대로 진행

```
Phase 1 (1/24-25):
  프롬프트 1-1 → 1-2 → 1-3 순서로 진행

Phase 2 (1/25-27):
  프롬프트 2-1 → 2-2 → 2-3 순서로 진행

Phase 3 (1/28-29):
  프롬프트 3-1 → 3-2 순서로 진행

Phase 4 (1/29-30):
  프롬프트 4-1 → 4-2 순서로 진행
```

### 3단계: 각 프롬프트 완료 후

```
바이브 생성 코드를 프로젝트에 적용:
1. 코드 복사
2. 적절한 파일에 붙여넣기
3. 테스트 실행
4. 버그 수정 (있으면)
5. Git 커밋
```

***

## 💡 프롬프트 커스터마이징 팁

### 각 프롬프트를 커스터마이징할 때:

1. **팀명 변경**
   ```
   "LearnTeam" → "당신의 서비스명"
   ```

2. **필드 추가/제거**
   ```
   "포트폴리오에 PDF 다운로드 기능 추가해줄래?" 
   → 기존 프롬프트에 한 줄만 추가
   ```

3. **UI 수정**
   ```
   "다크 모드를 기본으로 설정해줘"
   → 프롬프트 마지막에 추가
   ```

***

## 🎯 최종 결과물

이 프롬프트들을 모두 실행하면 **1월 31일까지**:

✅ 완전한 LearnTeam MVP 완성
✅ 팀 관리 기능
✅ 학습 로그 CRUD
✅ 자동 포트폴리오 생성
✅ 글 큐레이션 기본 기능
✅ 인증 시스템
✅ Vercel 배포 완료
✅ 베타 테스터 3명 준비!

***

**지금 바로 Cursor IDE를 열고 프롬프트 1-1부터 시작하세요!** 🚀

**화이팅!** 💪
