'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Portfolio {
  id: string;
  title: string;
  summary?: string;
  is_public: boolean;
  created_at: string;
  public_url?: string;
}

export default function TeamPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [teamId]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio`);
      if (!response.ok) {
        setError('포트폴리오를 불러올 수 없습니다');
        return;
      }
      const data = await response.json();
      setPortfolios(data);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/generate`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '포트폴리오 생성에 실패했습니다');
        setIsGenerating(false);
        return;
      }

      // 목록 새로고침
      await fetchPortfolios();
      setIsGenerating(false);
      
      // 생성된 포트폴리오로 이동
      router.push(`/teams/${teamId}/portfolio/${result.id}`);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      setIsGenerating(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('공개 링크가 복사되었습니다');
  };

  const handleTogglePublic = async (portfolioId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: !currentStatus }),
      });

      if (!response.ok) {
        alert('공개 상태 변경에 실패했습니다');
        return;
      }

      await fetchPortfolios();
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  const handleDelete = async (portfolioId: string) => {
    if (!confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('포트폴리오 삭제에 실패했습니다');
        return;
      }

      await fetchPortfolios();
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">포트폴리오</h1>
              <p className="text-gray-600">
                팀의 학습 로그로 자동 생성된 포트폴리오를 관리하세요
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '생성 중...' : '포트폴리오 생성'}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {portfolios.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">아직 생성된 포트폴리오가 없습니다.</p>
              <p className="text-gray-500 text-sm mb-6">
                위의 '포트폴리오 생성' 버튼을 클릭하여 첫 포트폴리오를 만들어보세요!
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isGenerating ? '생성 중...' : '포트폴리오 생성'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {portfolio.title}
                  </h3>
                  {portfolio.summary && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {portfolio.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        portfolio.is_public
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {portfolio.is_public ? '공개' : '비공개'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(portfolio.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/teams/${teamId}/portfolio/${portfolio.id}`}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      보기
                    </Link>
                    {portfolio.public_url && (
                      <button
                        onClick={() => handleCopyLink(portfolio.public_url!)}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        링크 복사
                      </button>
                    )}
                    <button
                      onClick={() => handleTogglePublic(portfolio.id, portfolio.is_public)}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {portfolio.is_public ? '비공개' : '공개'}
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
