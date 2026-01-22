import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],  // 개발 시 쿼리 로그 확인
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma