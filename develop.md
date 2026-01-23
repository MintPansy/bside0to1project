네, Supabase 완벽 통합이 현재 오류 해결에 더 효과적입니다.

현재 오류가 DB/인증/API 연동의 불명확함에서 비롯됐을 가능성 높음

Supabase로 통일하면 환경변수, 타입, 보안이 명확해져 재배포 시 안정성 up

MVP 단계에서 Supabase는 인증·DB·실시간 기능을 한 곳에서 관리할 수 있어 매우 효율적

다음은 Cursor 프롬프트와 Supabase 설정 가이드입니다.

📋 Cursor 프롬프트 (Supabase 완벽 통합)
1단계: 프로젝트 상태 진단 + Supabase 마이그레이션 계획
text
Read NOTES.md. 현재 라이브 배포 오류를 분석하고 Supabase 완벽 통합 로드맵을 세우세요.

【진단】
1. 현재 사용 중인 DB/인증/API 서비스 확인
2. 환경변수 (.env) 체크 - 누락/오류 찾기
3. 배포 로그에서 런타임 에러 원인 파악

【Supabase 마이그레이션 계획】
1. Supabase 프로젝트 생성 (한국 리전: ap-northeast-1)
2. 기존 DB 스키마 → Supabase PostgreSQL로 마이그레이션
3. 인증 (Auth) 설정: Google OAuth + 이메일/비밀번호
4. 실시간 DB 리스너 설정 (팀 로그 공유용)
5. RLS (Row Level Security) 정책 설정

【출력】
- 진단 보고서 (DIAGNOSIS.md)
- Supabase 마이그레이션 체크리스트 (SUPABASE_SETUP.md)
- 변경할 코드 경로 정리

최소 변경, 명확한 단계별 설명 포함.
2단계: Supabase 클라이언트 + 환경변수 설정
text
SUPABASE_SETUP.md 기반으로 Supabase 통합 환경 구축하세요.

【작업】
1. .env.local 생성:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (서버용)

2. lib/supabase.ts 생성 (클라이언트/서버 초기화):
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   
   export const supabaseServer = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
pages/api/auth/[...auth].ts (NextAuth + Supabase):

Google OAuth 연동

사용자 정보 Supabase에 자동 저장

.gitignore에 .env.local 추가

【테스트】

Supabase 대시보드에서 사용자/데이터 확인

로컬 개발 서버 실행 후 로그인 테스트

PR 생성 전 모든 env 변수 설정 확인.

text

### 3단계: DB 스키마 정의 + RLS 정책
Supabase 테이블 생성 및 보안 정책 설정하세요.

【테이블 구조】

users (id, email, name, created_at)

learning_logs (id, user_id, content, date, created_at)

team_logs (id, team_id, user_id, feedback, created_at)

curated_articles (id, user_id, url, title, shared_with_team, created_at)

teams (id, name, created_at)

team_members (id, team_id, user_id, role)

【RLS 정책】

users: 자신의 데이터만 조회/수정

learning_logs: 본인 or 팀원만 읽기 가능

team_logs: 팀원만 접근

curated_articles: 공개 여부에 따라 제어

【출력】

migration.sql (SQL 스크립트, Supabase SQL Editor에 복붙 가능)

RLS_POLICY.md (모든 정책 문서화)

테스트: Supabase 대시보드에서 데이터 삽입 후 조회 권한 확인.

text

### 4단계: 핵심 기능 구현 (학습 로그 CRUD)
Supabase와 연동된 핵심 기능을 구현하세요. Phase 1:

【학습 로그 CRUD】

components/LearningLogForm.tsx:

날짜, 내용 입력 (Markdown 에디터)

Supabase에 insert

에러 핸들링 (catch + toast)

pages/logs/index.tsx:

실시간 구독 (Supabase realtime)

날짜별 필터링

수정/삭제 기능

lib/hooks/useLearningLogs.ts:

useQuery로 데이터 페치

Supabase 구독 활용

【팀 로그 공유】

components/TeamLogBoard.tsx:

팀원 로그 조회

코드리뷰 피드백 댓글 기능

Supabase join으로 팀원 정보 가져오기

【테스트】

로그 생성/수정/삭제 테스트

실시간 반영 확인 (다른 탭에서 새로고침 없이 업데이트)

권한 확인 (다른 사용자의 데이터 접근 차단)

TypeScript 타입 안정성 필수, 모든 API 호출에 try-catch.

text

### 5단계: 배포 + 모니터링
Vercel 재배포 및 Supabase 프로덕션 환경 설정하세요.

【Vercel 환경변수】

Vercel 대시보드 → Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

재배포: git push → Vercel 자동 빌드

【Supabase 프로덕션】

Supabase 프로젝트 설정 → API Keys → Anon/Service Role Key 복사

대시보드 → Database → Backups 활성화

【모니터링】

Vercel Analytics 확인

Supabase 대시보드 → Monitor → Database 로드 체크

에러 로그 (Sentry or Vercel Logs)

배포 후 /api/health 엔드포인트로 Supabase 연결 확인.

text

***

## 🗂️ Supabase 설정 정리 (체크리스트)

### A. Supabase 프로젝트 생성
- [ ] https://app.supabase.com → New Project
- [ ] Organization: 개인 계정
- [ ] Project Name: `bside0to1-mvp`
- [ ] Database Password: 강력한 비밀번호
- [ ] Region: `ap-northeast-1` (도쿄, 한국에서 빠름)
- [ ] Pricing: Free Tier (충분함)
- [ ] 생성 완료 대기 (~2분)

### B. API 키 저장
Supabase Dashboard → Settings → API

NEXT_PUBLIC_SUPABASE_URL: https://[project-id].supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY: [anon-key]

SUPABASE_SERVICE_ROLE_KEY: [service-role-key]

이들을 .env.local에 저장

text

### C. 인증 (Auth) 설정
Supabase Dashboard → Authentication → Providers

Google OAuth 설정:

Google Cloud Console → OAuth 2.0 credentials 생성

Authorized redirect URIs:

http://localhost:3000/auth/callback

https://[your-domain].vercel.app/auth/callback

https://[project-id].supabase.co/auth/v1/callback

Client ID, Client Secret → Supabase에 입력

이메일/비밀번호:

Supabase에서 기본 활성화됨

Email confirmations: 필요 시 활성화

text

### D. 데이터베이스 테이블 생성
Supabase Dashboard → SQL Editor → New Query

-- Users (이미 auth.users가 있음, 프로필만 추가)
CREATE TABLE public.user_profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
username TEXT UNIQUE,
avatar_url TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

-- Teams
CREATE TABLE public.teams (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
creator_id UUID REFERENCES auth.users(id),
created_at TIMESTAMP DEFAULT NOW()
);

-- Team Members
CREATE TABLE public.team_members (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
role TEXT DEFAULT 'member', -- 'admin' or 'member'
joined_at TIMESTAMP DEFAULT NOW()
);

-- Learning Logs
CREATE TABLE public.learning_logs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
content TEXT NOT NULL,
log_date DATE DEFAULT CURRENT_DATE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- Team Logs (팀 공유 성장 기록)
CREATE TABLE public.team_logs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
content TEXT NOT NULL,
log_type TEXT, -- 'code_review', 'learning', 'insight'
created_at TIMESTAMP DEFAULT NOW()
);

-- Curated Articles (글 큐레이션)
CREATE TABLE public.curated_articles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
url TEXT NOT NULL,
title TEXT,
description TEXT,
is_public BOOLEAN DEFAULT FALSE,
shared_with_teams UUID[] DEFAULT '{}',
created_at TIMESTAMP DEFAULT NOW()
);

-- Comments (팀 로그 피드백)
CREATE TABLE public.comments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
team_log_id UUID REFERENCES public.team_logs(id) ON DELETE CASCADE,
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

text

### E. RLS (Row Level Security) 정책
Supabase Dashboard → Authentication → Policies

-- learning_logs: 본인 + 팀원만 읽기
CREATE POLICY "Users can view own logs or team logs"
ON public.learning_logs FOR SELECT
USING (
auth.uid() = user_id
OR auth.uid() IN (
SELECT user_id FROM public.team_members
WHERE team_id IN (
SELECT team_id FROM public.team_members
WHERE user_id = learning_logs.user_id
)
)
);

-- 본인만 insert/update/delete
CREATE POLICY "Users can manage own logs"
ON public.learning_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

... (team_logs, curated_articles 등도 유사하게)

text

### F. 로컬 개발 환경 설정
```bash
# 1. Node.js 설치 확인
node -v  # v18+

# 2. 프로젝트 설정
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. .env.local 생성
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# 4. 로컬 서버 실행
npm run dev

# 5. http://localhost:3000 접속 → 로그인 테스트
G. Vercel 배포 환경변수
text
Vercel Dashboard → Settings → Environment Variables

추가:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Deploy → 자동 빌드 시작