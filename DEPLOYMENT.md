# 🚀 배포 및 모니터링 가이드

**프로젝트**: LearnTeam MVP  
**배포 플랫폼**: Vercel  
**데이터베이스**: Supabase  
**최종 업데이트**: 2025년 1월

---

## 📋 배포 전 체크리스트

### 필수 사항

- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase 스키마 실행 (`migration.sql`)
- [ ] RLS 정책 적용 (`RLS_POLICY.md` 참고)
- [ ] 환경변수 설정 완료 (로컬 + Vercel)
- [ ] 로컬 개발 환경 테스트 통과
- [ ] 빌드 성공 확인 (`npm run build`)

---

## 1단계: Vercel 환경변수 설정

### A. Vercel 대시보드 접속

1. https://vercel.com 접속 및 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성
3. Settings → Environment Variables 이동

### B. 환경변수 추가

다음 환경변수들을 **모든 환경** (Production, Preview, Development)에 추가:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# 앱 URL 설정
NEXT_PUBLIC_APP_URL=https://[your-domain].vercel.app

# 이메일 인증 설정 (프로덕션에서는 true 권장)
REQUIRE_EMAIL_CONFIRMATION=true
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=true
```

### C. 환경변수 확인

각 환경변수가 올바르게 설정되었는지 확인:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key (절대 공개하지 말 것!)
- [ ] `NEXT_PUBLIC_APP_URL` - 프로덕션 도메인
- [ ] `REQUIRE_EMAIL_CONFIRMATION` - 이메일 인증 필요 여부

---

## 2단계: Supabase 프로덕션 설정

### A. API 키 확인

1. Supabase Dashboard → Settings → API 이동
2. 다음 키들을 확인 및 복사:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` `public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` `secret` key (`SUPABASE_SERVICE_ROLE_KEY`)

### B. 데이터베이스 백업 활성화

1. Supabase Dashboard → Database → Backups 이동
2. 자동 백업 활성화 확인
3. 필요시 수동 백업 생성

### C. 인증 설정 확인

1. Supabase Dashboard → Authentication → Providers 이동
2. 사용할 프로바이더 활성화 확인:
   - [ ] Email (필수)
   - [ ] Google OAuth (선택사항)

3. Redirect URLs 확인:
   ```
   http://localhost:3000/auth/callback
   https://[your-domain].vercel.app/auth/callback
   https://[project-id].supabase.co/auth/v1/callback
   ```

---

## 3단계: Git 저장소 연결 및 배포

### A. Git 저장소 연결

1. Vercel Dashboard → 프로젝트 → Settings → Git
2. Git 저장소 연결 (GitHub, GitLab, Bitbucket)
3. 브랜치 선택 (보통 `main` 또는 `master`)

### B. 빌드 설정 확인

Vercel은 Next.js를 자동으로 감지하지만, 필요시 확인:

- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

### C. 배포 실행

1. Git 저장소에 변경사항 푸시:
   ```bash
   git add .
   git commit -m "feat: Supabase 완전 통합 및 배포 준비"
   git push origin main
   ```

2. Vercel 자동 배포 시작 확인
3. 빌드 로그 확인 (에러 없어야 함)

---

## 4단계: 배포 후 테스트

### A. 기본 기능 테스트

배포 완료 후 다음을 테스트:

- [ ] **랜딩 페이지**: `/` 접속 확인
- [ ] **회원가입**: `/signup` 페이지에서 회원가입 테스트
- [ ] **로그인**: `/login` 페이지에서 로그인 테스트
- [ ] **대시보드**: `/dashboard` 접속 확인
- [ ] **팀 생성**: 팀 생성 기능 테스트
- [ ] **학습 로그**: 로그 작성/조회/수정/삭제 테스트

### B. 헬스 체크

배포된 앱의 `/api/health` 엔드포인트 확인:

```bash
curl https://[your-domain].vercel.app/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "checks": {
    "auth": "connected",
    "teams": true,
    "team_members": true,
    "users": true
  }
}
```

### C. 에러 확인

- [ ] 브라우저 콘솔 에러 확인
- [ ] Vercel Functions 로그 확인
- [ ] Supabase Dashboard → Logs 확인

---

## 5단계: 모니터링 설정

### A. Vercel 모니터링

#### Analytics

1. Vercel Dashboard → Analytics 이동
2. 웹 바이탈 (Web Vitals) 확인:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

#### Functions 로그

1. Vercel Dashboard → 프로젝트 → Functions 이동
2. API 라우트 실행 로그 확인
3. 에러 발생 시 즉시 확인

#### Speed Insights

1. Vercel Dashboard → Speed Insights 이동
2. 성능 메트릭 확인
3. 필요시 최적화 작업 수행

### B. Supabase 모니터링

#### Database 로드

1. Supabase Dashboard → Monitor → Database 이동
2. 다음 메트릭 확인:
   - Active Connections
   - Database Size
   - Query Performance

#### API 사용량

1. Supabase Dashboard → Monitor → API 이동
2. API 호출 수 및 에러율 확인
3. Rate Limit 확인

#### 인증 로그

1. Supabase Dashboard → Authentication → Logs 이동
2. 로그인/회원가입 이벤트 확인
3. 에러 발생 시 즉시 확인

### C. 에러 추적 (선택사항)

#### Sentry 설정 (권장)

1. Sentry 계정 생성 (https://sentry.io)
2. Next.js 프로젝트에 Sentry 추가:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. 환경변수 추가:
   ```env
   SENTRY_DSN=[your-sentry-dsn]
   ```

4. Vercel 환경변수에도 추가

---

## 6단계: 성능 최적화

### A. 이미지 최적화

`next.config.js`에 이미지 도메인 추가:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['[your-supabase-project-id].supabase.co'],
  },
};

module.exports = nextConfig;
```

### B. 환경변수 최적화

- `NEXT_PUBLIC_*` 변수만 클라이언트 번들에 포함
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용

### C. 데이터베이스 최적화

1. 인덱스 확인 (`migration.sql` 참고)
2. 쿼리 성능 모니터링
3. 필요시 쿼리 최적화

---

## 7단계: 보안 체크리스트

### 필수 사항

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되지 않았는지 확인
- [ ] RLS 정책이 모든 테이블에 적용되었는지 확인
- [ ] 환경변수가 Git 저장소에 커밋되지 않았는지 확인 (`.gitignore` 확인)
- [ ] HTTPS 사용 확인 (Vercel 기본 제공)
- [ ] CORS 설정 확인 (Supabase 기본 설정)

---

## 🐛 문제 해결

### 문제: 빌드 실패

**증상**: Vercel 빌드 에러

**해결책**:
1. 로컬에서 빌드 테스트: `npm run build`
2. 빌드 로그 확인 및 에러 메시지 확인
3. 환경변수 누락 확인
4. 의존성 문제 확인: `package-lock.json` 확인

### 문제: 환경변수 에러

**증상**: 런타임에서 환경변수 관련 에러

**해결책**:
1. Vercel Dashboard에서 환경변수 확인
2. 환경변수 이름 확인 (대소문자 구분)
3. 재배포 실행

### 문제: Supabase 연결 실패

**증상**: API 호출 시 Supabase 연결 에러

**해결책**:
1. Supabase 프로젝트 상태 확인
2. API 키 확인
3. 네트워크 문제 확인
4. `/api/health` 엔드포인트로 연결 테스트

### 문제: RLS 정책 에러

**증상**: 권한 없음 에러

**해결책**:
1. Supabase Dashboard → Authentication → Policies 확인
2. RLS 정책 재적용 (`RLS_POLICY.md` 참고)
3. 사용자 인증 상태 확인

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting/overview)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

**배포 완료일**: 2025년 1월  
**다음 단계**: 정기적인 모니터링 및 성능 최적화

