import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import FAQAccordion from '@/components/FAQAccordion';

export default async function LandingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 인증된 사용자는 대시보드로 리다이렉트
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 - 고정 네비게이션 바 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                LearnTeam
              </Link>
            </div>

            {/* 중앙 메뉴 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition">
                소개
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition">
                가격
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-blue-600 transition">
                문서
              </Link>
            </div>

            {/* 우측 버튼 */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                가입하기
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 히어로 섹션 - 전체 화면 높이 */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-white"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              팀 프로젝트 성장을 기록하고 포트폴리오로
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              분산된 정보는 그만, LearnTeam에서 한 곳에 관리하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium group"
              >
                무료로 시작하기
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-lg font-medium"
              >
                사례 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              LearnTeam의 핵심 기능
            </h2>
            <p className="text-xl text-gray-600">
              팀 프로젝트 성장을 위한 모든 것을 한 곳에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                팀 학습 기록 중앙화
              </h3>
              <p className="text-gray-600 mb-6">
                모든 팀의 로그를 한 곳에 정리하세요. 정보 분산 문제 완벽 해결!
              </p>
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                자세히 알아보기 →
              </Link>
            </div>

            {/* 카드 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                자동 포트폴리오 생성
              </h3>
              <p className="text-gray-600 mb-6">
                학습 기록으로 1클릭에 포트폴리오 완성. 시간 낭비는 안녕!
              </p>
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                자세히 알아보기 →
              </Link>
            </div>

            {/* 카드 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                자동 요약 & 정리
              </h3>
              <p className="text-gray-600 mb-6">
                AI가 배운 점을 자동으로 정리해줍니다. 배운 거 정리가 쉬워집니다
              </p>
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                자세히 알아보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              간단한 가격 정책
            </h2>
            <p className="text-xl text-gray-600">
              지금은 모두 무료입니다
            </p>
          </div>
          <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg p-8 border-2 border-blue-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">무료 플랜</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                무료
              </div>
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  무제한 팀 생성
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  무제한 학습 로그
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  자동 포트폴리오 생성
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  팀원 초대 기능
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 사용자 추천말 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              사용자들의 추천
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 추천말 1 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "정보가 분산되어 있어서 힘들었는데 LearnTeam으로 완벽 해결!"
              </p>
              <p className="text-sm text-gray-600 font-medium">
                - 김개발 (20대 개발자)
              </p>
            </div>

            {/* 추천말 2 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "포트폴리오 만들 시간이 없었는데 자동 생성 기능이 정말 편해요!"
              </p>
              <p className="text-sm text-gray-600 font-medium">
                - 박코딩 (대학생)
              </p>
            </div>

            {/* 추천말 3 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "배운 거 정리가 안 됐는데 이제 자동으로 정리해줘서 너무 좋아요!"
              </p>
              <p className="text-sm text-gray-600 font-medium">
                - 이학습 (주니어 개발자)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 회사 정보 */}
            <div>
              <h3 className="text-xl font-bold mb-4">LearnTeam</h3>
              <p className="text-gray-400">
                팀 프로젝트 성장을 기록하고 포트폴리오로 변환하는 플랫폼입니다.
              </p>
            </div>

            {/* 빠른 링크 */}
            <div>
              <h3 className="text-xl font-bold mb-4">빠른 링크</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition">
                    소개
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-white transition">
                    가격
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition">
                    로그인
                  </Link>
                </li>
              </ul>
            </div>

            {/* 소셜 미디어 */}
            <div>
              <h3 className="text-xl font-bold mb-4">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-1.004-.015-1.97-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 LearnTeam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

