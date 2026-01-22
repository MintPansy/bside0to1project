# 🚀 Vercel 배포 가이드

## ⚠️ 중요: SQLite 제한사항

**Vercel에서는 SQLite를 직접 사용할 수 없습니다!**

Vercel은 읽기 전용 파일 시스템을 사용하므로, 파일 기반 데이터베이스인 SQLite를 사용할 수 없습니다.

## ✅ 해결 방법

### 옵션 1: Supabase로 완전 전환 (권장)

현재 하이브리드 접근법에서 **프로덕션에서는 Supabase를 사용**하도록 전환:

1. **Supabase에 스키마 생성**
   - `supabase/schema.sql` 파일을 Supabase SQL Editor에서 실행

2. **코드 수정**
   - 프로덕션 환경에서는 Supabase 사용
   - 개발 환경에서는 SQLite 사용

### 옵션 2: 조건부 데이터베이스 사용

환경 변수로 데이터베이스를 선택:

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

// Vercel에서는 Supabase 사용, 로컬에서는 SQLite
const useLocalDb = process.env.USE_LOCAL_DB === 'true'

export const prisma = useLocalDb 
  ? new PrismaClient()
  : null // Supabase 사용
```

## 📋 Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

### 필수 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 선택적 환경 변수

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
REQUIRE_EMAIL_CONFIRMATION=false
```

## 🔧 빌드 설정

### package.json

빌드 스크립트에 `prisma generate`가 포함되어 있습니다:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### vercel.json (선택)

필요시 `vercel.json` 파일을 생성하여 빌드 설정을 커스터마이즈:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

## 🐛 문제 해결

### 에러: "Prisma Client has not been generated"

**해결책:**
```bash
# 로컬에서 실행
npm run db:generate

# Git에 커밋
git add .
git commit -m "fix: generate prisma client"
git push
```

### 에러: "Missing Supabase environment variables"

**해결책:**
1. Vercel 대시보드 → Settings → Environment Variables
2. `NEXT_PUBLIC_SUPABASE_URL` 추가
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
4. 재배포

### 에러: "Cannot find module '@prisma/client'"

**해결책:**
```bash
# package.json에 prisma가 있는지 확인
npm install prisma @prisma/client

# Git에 커밋
git add package.json package-lock.json
git commit -m "fix: add prisma dependencies"
git push
```

## 📝 배포 체크리스트

- [ ] Vercel에 Supabase 환경 변수 설정
- [ ] `package.json`에 `prisma generate` 포함 확인
- [ ] Prisma 클라이언트가 빌드에 포함되는지 확인
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] Vercel 배포 로그 확인

## 🎯 현재 상태

현재 프로젝트는:
- ✅ **Supabase Auth**: 완전히 설정됨 (프로덕션 준비)
- ⚠️ **로컬 SQLite**: 개발용으로만 사용 (Vercel에서는 사용 불가)

**권장 사항**: 프로덕션 배포 전에 Supabase로 완전 전환하거나, 조건부 로직을 추가하세요.

