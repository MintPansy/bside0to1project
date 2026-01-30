'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { suppressConsoleWarnings } from '@/lib/suppress-warnings'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

// 개발 환경에서 불필요한 경고 억제
if (typeof window !== 'undefined') {
  suppressConsoleWarnings()
}

// 인증 스킵 모드 (클라이언트용)
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'

// 데모 사용자
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@learnteam.com',
  user_metadata: { name: '데모 사용자' },
  is_anonymous: false,
} as unknown as User

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAnonymous: boolean
  isDemoMode: boolean
}

type AuthContextType = AuthState & {
  signOut: () => Promise<void>
  signInAnonymously: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// 안전한 useAuth - Provider 밖에서도 사용 가능 (null 반환)
export function useAuthSafe() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: SKIP_AUTH ? DEMO_USER : null,
    session: SKIP_AUTH ? ({ user: DEMO_USER } as unknown as Session) : null,
    isLoading: !SKIP_AUTH, // 데모 모드면 바로 로딩 완료
    isAnonymous: false,
    isDemoMode: SKIP_AUTH,
  })

  // Supabase 클라이언트를 한 번만 생성 (매 렌더 재생성 방지)
  const supabase = useMemo(() => createClient(), [])

  // 세션 상태 업데이트 헬퍼
  const updateState = useCallback((session: Session | null) => {
    setState(prev => ({
      ...prev,
      user: session?.user ?? null,
      session,
      isLoading: false,
      isAnonymous: session?.user?.is_anonymous ?? false,
    }))
  }, [])

  // 초기 세션 로드 + onAuthStateChange 구독
  useEffect(() => {
    // 데모 모드면 Supabase 세션 무시
    if (SKIP_AUTH) return

    // 1) 초기 세션 (쿠키에서 파싱, 네트워크 X)
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateState(session)
    })

    // 2) 실시간 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        updateState(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, updateState])

  // 로그아웃
  const signOut = useCallback(async () => {
    if (SKIP_AUTH) return // 데모 모드에서는 무시
    setState(prev => ({ ...prev, isLoading: true }))
    await supabase.auth.signOut()
  }, [supabase])

  // 익명 로그인
  const signInAnonymously = useCallback(async () => {
    if (SKIP_AUTH) return // 데모 모드에서는 무시
    setState(prev => ({ ...prev, isLoading: true }))
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('[AuthProvider] signInAnonymously failed:', error.message)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [supabase])

  // 세션 수동 갱신
  const refreshSession = useCallback(async () => {
    if (SKIP_AUTH) return // 데모 모드에서는 무시
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('[AuthProvider] refreshSession failed:', error.message)
    } else {
      updateState(data.session)
    }
  }, [supabase, updateState])

  const value: AuthContextType = {
    ...state,
    signOut,
    signInAnonymously,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
