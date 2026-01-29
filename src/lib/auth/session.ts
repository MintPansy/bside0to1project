import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Session, User } from '@supabase/supabase-js'

export type SessionResult = {
  session: Session | null
  user: User | null
  error: string | null
}

/**
 * API Route에서 세션 검증
 * - getSession()만 사용 (네트워크 요청 최소화)
 * - 미들웨어에서 이미 refresh 처리했으므로 여기선 파싱만
 */
export async function getServerSession(): Promise<SessionResult> {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { session: null, user: null, error: error.message }
    }

    return {
      session,
      user: session?.user ?? null,
      error: null,
    }
  } catch (err) {
    return {
      session: null,
      user: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * 인증 필수 API Route용 래퍼
 * - 세션 없으면 401 반환
 * - anonymous 사용자 허용 여부 선택
 */
export async function requireAuth(options?: { allowAnonymous?: boolean }): Promise<{
  session: Session
  user: User
  isAnonymous: boolean
} | Response> {
  const { session, user, error } = await getServerSession()

  if (error || !session || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: '로그인이 필요합니다' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const isAnonymous = user.is_anonymous ?? false

  // anonymous 사용자 차단 (기본값)
  if (isAnonymous && !options?.allowAnonymous) {
    return new Response(
      JSON.stringify({ error: 'Forbidden', message: '계정 로그인이 필요합니다' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return { session, user, isAnonymous }
}

/**
 * JWT에서 user_id 직접 추출 (세션 파싱 없이)
 * - 가장 빠른 방법이지만 검증은 안 됨
 * - RLS가 보안을 담당하는 경우에만 사용
 */
export async function getUserIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookie = allCookies.find(c =>
      c.name.includes('-auth-token') && !c.name.includes('.')
    )

    if (!authCookie) return null

    const parsed = JSON.parse(authCookie.value)
    const accessToken = parsed.access_token
    if (!accessToken) return null

    // JWT payload에서 sub (user_id) 추출
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    return payload.sub || null
  } catch {
    return null
  }
}
