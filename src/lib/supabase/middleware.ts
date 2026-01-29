import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Session } from '@supabase/supabase-js'

export type UpdateSessionResult = {
  response: NextResponse
  session: Session | null
}

export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    }
  )

  // 1) JWT 쿠키에서 직접 만료 시간 체크 (네트워크 요청 없음)
  const accessToken = getAccessTokenFromCookies(request)

  if (accessToken && !isTokenExpired(accessToken)) {
    // 토큰 아직 유효 → getSession()으로 세션 객체만 파싱 (네트워크 X)
    const { data: { session } } = await supabase.auth.getSession()
    return { response, session }
  }

  // 2) 토큰 만료 or 없음 → refresh 1번만 시도
  const { data: { session } } = await supabase.auth.getSession()

  // refresh_token이 없으면 시도하지 않음 (400 에러 방지)
  if (!session) {
    return { response, session: null }
  }

  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      // 429, 400 등 → 로그만 남기고 기존 세션 유지
      console.warn('[middleware] refresh failed:', error.code, error.message)
      return { response, session }
    }
    return { response, session: data.session }
  } catch (err) {
    console.error('[middleware] refresh error:', err)
    return { response, session }
  }
}

// JWT에서 exp 클레임 체크 (네트워크 요청 없음)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    // 만료 60초 전부터 refresh 대상으로 간주
    return Date.now() >= exp - 60_000
  } catch {
    return true
  }
}

// 쿠키에서 access_token 직접 추출 (Supabase 기본 쿠키명)
function getAccessTokenFromCookies(request: NextRequest): string | null {
  const cookies = request.cookies.getAll()
  const authCookie = cookies.find(c => c.name.includes('-auth-token') && !c.name.includes('.'))

  if (!authCookie) return null

  try {
    const parsed = JSON.parse(authCookie.value)
    return parsed.access_token || null
  } catch {
    // 청크된 쿠키일 수 있음 → getSession()에 맡김
    return null
  }
}
