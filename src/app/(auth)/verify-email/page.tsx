'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(searchParams.get('email'));

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token) {
      setStatus('error');
      setError('인증 토큰이 없습니다');
      return;
    }

    // 이메일 인증 처리
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}&type=${type || 'email'}`);
        
        if (response.ok) {
          setStatus('success');
          // 2초 후 대시보드로 리다이렉트
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          const result = await response.json();
          setStatus('error');
          setError(result.error || '이메일 인증에 실패했습니다');
        }
      } catch (err) {
        setStatus('error');
        setError('네트워크 오류가 발생했습니다');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResend = async () => {
    if (!email) {
      alert('이메일 주소를 입력해주세요');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error || '이메일 재전송에 실패했습니다');
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">이메일 인증 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              {email ? `${email}로` : '이메일로'} 인증 링크를 보냈습니다.
              <br />
              이메일을 확인하고 링크를 클릭해주세요.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="인증 이메일을 받을 주소"
                />
              </div>
              <button
                onClick={handleResend}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                인증 이메일 재전송
              </button>
              <Link
                href="/login"
                className="block text-center text-blue-600 hover:text-blue-800"
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 완료!</h2>
          <p className="text-gray-600 mb-4">이메일이 성공적으로 인증되었습니다.</p>
          <p className="text-sm text-gray-500">잠시 후 대시보드로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증 실패</h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="인증 이메일을 받을 주소"
                />
              </div>
              <button
                onClick={handleResend}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                인증 이메일 재전송
              </button>
              <Link
                href="/login"
                className="block text-center text-blue-600 hover:text-blue-800"
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

