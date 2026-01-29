import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // updateSession에서 세션 정보도 함께 반환받음 (중복 호출 제거)
  const { response, session } = await updateSession(req)

  const { pathname } = req.nextUrl

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
