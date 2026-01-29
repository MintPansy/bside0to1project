'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const { signOut, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) {
      return
    }

    setIsLoading(true)
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const loading = isLoading || authLoading

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
