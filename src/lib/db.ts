// Prisma Client (로컬 SQLite 데이터베이스)
// 하이브리드 접근: Supabase Auth + 로컬 데이터베이스

import { PrismaClient } from '@prisma/client'

// PrismaClient는 개발 환경에서 hot reload 시 여러 인스턴스가 생성되는 것을 방지
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

