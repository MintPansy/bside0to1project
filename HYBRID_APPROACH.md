# 🎯 하이브리드 접근법 가이드

## 개요

이 프로젝트는 **하이브리드 접근법**을 사용합니다:

- **로그인/인증**: Supabase Auth (완료 ✅)
- **프로젝트 데이터**: 로컬 SQLite (Prisma) (완료 ✅)

## 왜 하이브리드 접근법인가?

| 항목 | Supabase Auth | 로컬 SQLite |
|------|--------------|-------------|
| **장점** | 완벽한 인증/인가, OAuth 지원 | 빠른 개발/디버깅, 오프라인 가능 |
| **단점** | 배포 의존성 | 팀 공유 어려움 |
| **적합** | 사용자 관리 | MVP 빠른 구현 |

## 📁 프로젝트 구조

```
LearnTeam/
├── src/
│   ├── lib/
│   │   ├── supabase/        # Supabase Auth (로그인)
│   │   │   ├── server.ts
│   │   │   └── client.ts
│   │   └── db.ts            # Prisma Client (로컬 데이터)
│   └── app/
│       ├── api/
│       │   ├── auth/        # Supabase Auth API
│       │   └── teams/       # 로컬 DB API (향후)
│       └── dashboard/
├── prisma/
│   ├── schema.prisma        # 데이터베이스 스키마
│   └── dev.db               # SQLite 데이터베이스 파일
└── .env.local               # 환경 변수
```

## 🚀 사용 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음을 추가:

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Prisma Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"
```

### 2. 데이터베이스 마이그레이션

```bash
# 스키마 변경 후 마이그레이션
npm run db:migrate

# 또는 스키마를 데이터베이스에 직접 푸시 (개발용)
npm run db:push
```

### 3. Prisma Studio (데이터베이스 GUI)

```bash
npm run db:studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터베이스를 시각적으로 관리할 수 있습니다.

## 💻 코드 예시

### 로그인 (Supabase Auth)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function login(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}
```

### 데이터 조회 (로컬 DB)

```typescript
import { prisma } from '@/lib/db'

export async function getTeams(userId: string) {
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { members: { some: { userId } } }
      ]
    },
    include: {
      members: true,
      learningLogs: true,
    }
  })
  return teams
}
```

### 하이브리드 사용 (Auth + DB)

```typescript
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function createTeam(name: string) {
  // 1. Supabase에서 현재 사용자 확인
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  // 2. 로컬 DB에 팀 생성
  const team = await prisma.team.create({
    data: {
      name,
      createdBy: user.id,
    }
  })
  
  return team
}
```

## 📅 마이그레이션 계획

### Week 1: 하이브리드 (현재)
- ✅ Supabase Auth 설정
- ✅ 로컬 SQLite 설정
- ⏳ CRUD 기능 구현

### Week 2: Supabase 전환 (선택)
필요시 로컬 데이터를 Supabase로 마이그레이션:

```bash
# 1. Supabase에 스키마 생성
# 2. 데이터 내보내기/가져오기
# 3. 코드 업데이트
```

## 🔧 유용한 명령어

```bash
# Prisma 클라이언트 재생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# Prisma Studio 실행
npm run db:studio

# 스키마를 DB에 직접 푸시 (개발용)
npm run db:push
```

## ⚠️ 주의사항

1. **`.env.local` 파일은 Git에 커밋하지 마세요!**
2. **`prisma/dev.db` 파일도 Git에 커밋하지 마세요!** (`.gitignore`에 추가됨)
3. **프로덕션 배포 시**: SQLite는 파일 기반이므로 Vercel 등에서는 사용하기 어렵습니다. 이 경우 Supabase로 전환하거나 PostgreSQL을 사용하세요.

## 📚 참고 자료

- [Prisma 문서](https://www.prisma.io/docs)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Next.js + Prisma 가이드](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

