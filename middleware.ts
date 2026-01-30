import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 환경 변수로 인증 스킵 여부 결정
const SKIP_AUTH = process.env.SKIP_AUTH === 'true'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 인증 스킵 모드: 모든 보호 라우트 접근 허용
  if (SKIP_AUTH) {
    // 루트 페이지 → 대시보드로 리다이렉트
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // 로그인/회원가입 페이지 → 대시보드로 리다이렉트
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // 일반 모드: 기존 인증 로직
  const { response, session } = await updateSession(req)

  // Protected routes
  const protectedRoutes = ['/dashboard', '/teams', '/logs']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth routes
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
