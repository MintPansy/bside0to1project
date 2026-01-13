'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Portfolio {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  is_public: boolean;
  created_at: string;
  teams?: {
    name: string;
    description?: string;
  };
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const portfolioId = params.portfolioId as string;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [portfolioId]);

  const fetchPortfolio = async () => {
    try {
      // 공개 포트폴리오는 인증 없이 조회 가능
      const response = await fetch(`/api/portfolio/${portfolioId}`);
      if (!response.ok) {
        setError('포트폴리오를 찾을 수 없거나 공개되지 않았습니다');
        return;
      }
      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '포트폴리오를 찾을 수 없습니다'}
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← LearnTeam 홈으로
            </Link>
            {portfolio.teams && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {portfolio.teams.name}
                </h2>
                {portfolio.teams.description && (
                  <p className="text-gray-600">{portfolio.teams.description}</p>
                )}
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900">{portfolio.title}</h1>
            {portfolio.summary && (
              <p className="text-gray-600 mt-2">{portfolio.summary}</p>
            )}
          </div>

          {/* 포트폴리오 내용 */}
          <div className="bg-white shadow rounded-lg p-8">
            <div className="prose max-w-none">
              {portfolio.content ? (
                <ReactMarkdown>{portfolio.content}</ReactMarkdown>
              ) : (
                <p className="text-gray-600">포트폴리오 내용이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>생성일: {new Date(portfolio.created_at).toLocaleString('ko-KR')}</p>
            <p className="mt-2">
              <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                LearnTeam에서 나만의 포트폴리오 만들기 →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

