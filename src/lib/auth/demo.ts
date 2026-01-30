/**
 * 데모/개발용 인증 스킵 설정
 * SKIP_AUTH=true 일 때 사용
 */

export const SKIP_AUTH = process.env.SKIP_AUTH === 'true'

// 데모 사용자 정보
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@learnteam.com',
  name: '데모 사용자',
  is_anonymous: false,
}

// 데모 세션 (API routes에서 사용)
export const DEMO_SESSION = {
  user: {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    user_metadata: { name: DEMO_USER.name },
    is_anonymous: false,
  },
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
}

/**
 * API Route에서 인증 스킵 시 사용할 세션 반환
 */
export function getDemoSession() {
  if (!SKIP_AUTH) return null
  return {
    session: DEMO_SESSION,
    user: DEMO_SESSION.user,
  }
}
