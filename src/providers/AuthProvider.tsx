'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAnonymous: boolean
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
    user: null,
    session: null,
    isLoading: true,
    isAnonymous: false,
  })

  const supabase = createClient()

  // 세션 상태 업데이트 헬퍼
  const updateState = useCallback((session: Session | null) => {
    setState({
      user: session?.user ?? null,
      session,
      isLoading: false,
      isAnonymous: session?.user?.is_anonymous ?? false,
    })
  }, [])

  // 초기 세션 로드 + onAuthStateChange 구독
  useEffect(() => {
    // 1) 초기 세션 (쿠키에서 파싱, 네트워크 X)
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateState(session)
    })

    // 2) 실시간 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        updateState(session)

        // 토큰 갱신 시 쿠키 동기화를 위해 서버에 알림 (선택적)
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          // 서버 컴포넌트 캐시 무효화
          // router.refresh() 대신 fetch로 처리 가능
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, updateState])

  // 로그아웃
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    await supabase.auth.signOut()
    // onAuthStateChange가 상태 업데이트 처리
  }, [supabase])

  // 익명 로그인 (비로그인 사용자도 일부 기능 사용 가능하게)
  const signInAnonymously = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('[AuthProvider] signInAnonymously failed:', error.message)
      setState(prev => ({ ...prev, isLoading: false }))
    }
    // 성공 시 onAuthStateChange가 상태 업데이트 처리
  }, [supabase])

  // 세션 수동 갱신
  const refreshSession = useCallback(async () => {
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
