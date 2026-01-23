# 🚀 Supabase 완벽 통합 마이그레이션 체크리스트

**프로젝트**: LearnTeam MVP  
**목표**: Supabase로 완전 통합하여 안정적인 배포 환경 구축  
**예상 소요 시간**: 2-3시간

---

## 📋 마이그레이션 개요

현재 프로젝트는 이미 Supabase를 사용하고 있으나, 완전한 통합을 위해 다음 작업이 필요합니다:

1. ✅ Supabase 프로젝트 생성 및 설정
2. ✅ 환경변수 설정 (로컬 + Vercel)
3. ✅ 데이터베이스 스키마 적용
4. ✅ RLS 정책 설정
5. ✅ 인증 설정 (Google OAuth)
6. ⚠️ Prisma 의존성 정리 (선택사항)

---

## 1단계: Supabase 프로젝트 생성

### A. 프로젝트 생성

- [ ] https://app.supabase.com 접속 및 로그인
- [ ] "New Project" 클릭
- [ ] 프로젝트 정보 입력:
  - **Organization**: 개인 계정 선택
  - **Project Name**: `bside0to1-mvp` (또는 원하는 이름)
  - **Database Password**: 강력한 비밀번호 생성 및 저장 ⚠️
  - **Region**: `ap-northeast-1` (도쿄, 한국에서 빠름) ✅
  - **Pricing Plan**: Free Tier 선택
- [ ] 프로젝트 생성 완료 대기 (~2분)

### B. API 키 확인 및 저장

- [ ] Supabase Dashboard → Settings → API 이동
- [ ] 다음 값들을 복사하여 안전한 곳에 저장:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key] ⚠️ 절대 공개하지 말 것!
```

---

## 2단계: 환경변수 설정

### A. 로컬 개발 환경 (`.env.local`)

- [ ] 프로젝트 루트에 `.env.local` 파일 생성
- [ ] 다음 내용 추가:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 이메일 인증 설정 (개발 환경에서는 false 권장)
REQUIRE_EMAIL_CONFIRMATION=false
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=false
```

- [ ] `.gitignore`에 `.env.local` 포함 확인 (이미 포함되어 있음 ✅)

### B. Vercel 프로덕션 환경

- [ ] Vercel Dashboard → 프로젝트 선택 → Settings → Environment Variables 이동
- [ ] 다음 환경변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
NEXT_PUBLIC_APP_URL=https://[your-domain].vercel.app
REQUIRE_EMAIL_CONFIRMATION=true  # 프로덕션에서는 true 권장
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=true
```

- [ ] 각 환경변수에 대해 Production, Preview, Development 환경 모두 선택
- [ ] 저장 후 재배포

---

## 3단계: 데이터베이스 스키마 적용

### A. 기본 스키마 실행

- [ ] Supabase Dashboard → SQL Editor 이동
- [ ] "New Query" 클릭
- [ ] `supabase/schema.sql` 파일 내용 복사하여 붙여넣기
- [ ] "Run" 클릭하여 실행
- [ ] 성공 메시지 확인

### B. 스키마 확인

- [ ] Supabase Dashboard → Table Editor 이동
- [ ] 다음 테이블들이 생성되었는지 확인:
  - [ ] `users`
  - [ ] `teams`
  - [ ] `team_members`
  - [ ] `learning_logs`
  - [ ] `portfolios`
  - [ ] `curated_links`

---

## 4단계: RLS (Row Level Security) 정책 설정

### A. RLS 정책 적용

- [ ] Supabase Dashboard → SQL Editor 이동
- [ ] "New Query" 클릭
- [ ] `supabase/fix_rls_final_working.sql` 파일 내용 복사하여 붙여넣기
- [ ] "Run" 클릭하여 실행
- [ ] 성공 메시지 확인

### B. RLS 정책 확인

- [ ] Supabase Dashboard → Authentication → Policies 이동
- [ ] 각 테이블에 대해 정책이 생성되었는지 확인:
  - [ ] `users` - SELECT, INSERT, UPDATE 정책
  - [ ] `teams` - SELECT, INSERT, UPDATE, DELETE 정책
  - [ ] `team_members` - SELECT, INSERT, DELETE 정책
  - [ ] `learning_logs` - SELECT, INSERT, UPDATE, DELETE 정책
  - [ ] `portfolios` - SELECT, INSERT, UPDATE, DELETE 정책
  - [ ] `curated_links` - SELECT, INSERT, UPDATE, DELETE 정책

---

## 5단계: 인증 설정

### A. 이메일/비밀번호 인증

- [ ] Supabase Dashboard → Authentication → Providers 이동
- [ ] "Email" 프로바이더 확인:
  - [ ] "Enable Email provider" 활성화 확인
  - [ ] "Confirm email" 설정 확인 (개발: OFF, 프로덕션: ON)

### B. Google OAuth 설정 (선택사항)

- [ ] Google Cloud Console 접속 (https://console.cloud.google.com)
- [ ] 프로젝트 생성 또는 선택
- [ ] APIs & Services → Credentials 이동
- [ ] "Create Credentials" → "OAuth 2.0 Client ID" 선택
- [ ] 애플리케이션 유형: "Web application"
- [ ] Authorized redirect URIs 추가:
  ```
  http://localhost:3000/auth/callback
  https://[your-domain].vercel.app/auth/callback
  https://[project-id].supabase.co/auth/v1/callback
  ```
- [ ] Client ID와 Client Secret 복사
- [ ] Supabase Dashboard → Authentication → Providers → Google 이동
- [ ] "Enable Google provider" 활성화
- [ ] Client ID와 Client Secret 입력
- [ ] 저장

---

## 6단계: 로컬 개발 환경 테스트

### A. 의존성 설치

- [ ] 프로젝트 루트에서 다음 명령 실행:
  ```bash
  npm install
  ```

### B. 개발 서버 실행

- [ ] 다음 명령 실행:
  ```bash
  npm run dev
  ```
- [ ] 브라우저에서 http://localhost:3000 접속
- [ ] 콘솔 에러 확인 (없어야 함)

### C. 기능 테스트

- [ ] 회원가입 테스트:
  - [ ] `/signup` 페이지 접속
  - [ ] 이메일/비밀번호 입력
  - [ ] 회원가입 성공 확인
  - [ ] Supabase Dashboard → Authentication → Users에서 사용자 확인

- [ ] 로그인 테스트:
  - [ ] `/login` 페이지 접속
  - [ ] 이메일/비밀번호 입력
  - [ ] 로그인 성공 확인
  - [ ] 대시보드 접근 확인

- [ ] 헬스 체크 테스트:
  - [ ] http://localhost:3000/api/health 접속
  - [ ] 모든 테이블이 `true`로 표시되는지 확인

---

## 7단계: 코드 변경 사항 (필요 시)

### A. Prisma 의존성 정리 (선택사항)

현재 프로젝트는 이미 Supabase만 사용하고 있으나, Prisma 관련 파일이 남아있습니다.

**제거 가능한 파일:**
- [ ] `prisma/schema.prisma` (보관용으로 유지 가능)
- [ ] `src/lib/db.ts` (사용되지 않음)
- [ ] `package.json`에서 Prisma 의존성 제거 (선택사항)

**주의**: Prisma를 완전히 제거하기 전에 모든 코드에서 사용되지 않는지 확인 필요.

### B. 빌드 스크립트 수정 (선택사항)

`package.json`의 빌드 스크립트에서 Prisma 제거:

```json
{
  "scripts": {
    "build": "next build",  // "prisma generate &&" 제거
    "start": "next start"
  }
}
```

---

## 8단계: Vercel 배포

### A. 환경변수 설정 확인

- [ ] Vercel Dashboard에서 모든 환경변수 설정 확인 (2단계 B 참고)

### B. 배포

- [ ] Git 저장소에 변경사항 커밋 및 푸시:
  ```bash
  git add .
  git commit -m "feat: Supabase 완전 통합"
  git push
  ```
- [ ] Vercel 자동 배포 시작 확인
- [ ] 빌드 로그 확인 (에러 없어야 함)

### C. 배포 후 테스트

- [ ] 프로덕션 URL 접속
- [ ] 회원가입/로그인 테스트
- [ ] `/api/health` 엔드포인트 테스트
- [ ] 주요 기능 동작 확인

---

## 9단계: 모니터링 설정

### A. Supabase 모니터링

- [ ] Supabase Dashboard → Monitor 이동
- [ ] Database 로드 확인
- [ ] API 사용량 확인
- [ ] 에러 로그 확인

### B. Vercel 모니터링

- [ ] Vercel Dashboard → Analytics 확인
- [ ] Functions 로그 확인
- [ ] 에러 발생 시 즉시 확인

---

## ✅ 완료 체크리스트

마이그레이션이 완료되면 다음 항목을 모두 확인하세요:

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경변수 설정 완료 (로컬 + Vercel)
- [ ] 데이터베이스 스키마 적용 완료
- [ ] RLS 정책 적용 완료
- [ ] 인증 설정 완료 (이메일/비밀번호 + Google OAuth)
- [ ] 로컬 개발 환경 테스트 통과
- [ ] Vercel 배포 성공
- [ ] 프로덕션 환경 테스트 통과
- [ ] 모니터링 설정 완료

---

## 🐛 문제 해결

### 문제: 환경변수 에러

**증상**: `Missing Supabase environment variables!` 에러

**해결책**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 정확한지 확인 (대소문자 구분)
3. 개발 서버 재시작

### 문제: 테이블을 찾을 수 없음

**증상**: `relation "teams" does not exist` 에러

**해결책**:
1. Supabase Dashboard → SQL Editor에서 `supabase/schema.sql` 실행 확인
2. Table Editor에서 테이블 존재 확인
3. 환경변수가 올바른 Supabase 프로젝트를 가리키는지 확인

### 문제: RLS 정책 에러

**증상**: 권한 없음 에러 또는 무한 재귀 에러

**해결책**:
1. `supabase/fix_rls_final_working.sql` 실행 확인
2. Supabase Dashboard → Authentication → Policies에서 정책 확인
3. 필요시 RLS 정책 재생성

### 문제: 인증 실패

**증상**: 로그인/회원가입 실패

**해결책**:
1. Supabase Dashboard → Authentication → Providers에서 프로바이더 활성화 확인
2. 이메일 인증 설정 확인 (개발 환경에서는 OFF 권장)
3. 브라우저 콘솔에서 에러 메시지 확인

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

**마이그레이션 시작일**: 2025년 1월  
**예상 완료일**: 마이그레이션 시작 후 2-3시간 내  
**다음 단계**: 2단계 - Supabase 클라이언트 + 환경변수 설정

