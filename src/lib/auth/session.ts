import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SKIP_AUTH, DEMO_USER } from './demo'
import type { Session, User } from '@supabase/supabase-js'

export type SessionResult = {
  session: Session | null
  user: User | null
  error: string | null
}

/**
 * API Route에서 세션 검증
 * - SKIP_AUTH=true 일 때 데모 세션 반환
 * - 일반 모드: getSession()만 사용 (네트워크 요청 최소화)
 */
export async function getServerSession(): Promise<SessionResult> {
  // 데모 모드: 가짜 세션 반환
  if (SKIP_AUTH) {
    return {
      session: { user: DEMO_USER } as unknown as Session,
      user: DEMO_USER as unknown as User,
      error: null,
    }
  }

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
 * - SKIP_AUTH=true 일 때 항상 데모 사용자 반환
 * - 세션 없으면 401 반환
 */
export async function requireAuth(options?: { allowAnonymous?: boolean }): Promise<{
  session: Session
  user: User
  isAnonymous: boolean
} | Response> {
  // 데모 모드: 항상 인증 통과
  if (SKIP_AUTH) {
    return {
      session: { user: DEMO_USER } as unknown as Session,
      user: DEMO_USER as unknown as User,
      isAnonymous: false,
    }
  }

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
 */
export async function getUserIdFromCookie(): Promise<string | null> {
  // 데모 모드
  if (SKIP_AUTH) {
    return DEMO_USER.id
  }

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
