'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { PortfolioWithStats } from '@/types/portfolio';

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [portfolio, setPortfolio] = useState<PortfolioWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      if (!slug) {
        setError('포트폴리오 URL이 올바르지 않습니다');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/portfolio/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('포트폴리오를 찾을 수 없습니다');
          } else {
            setError('포트폴리오를 불러오는 중 오류가 발생했습니다');
          }
          setLoading(false);
          return;
        }

        const data: PortfolioWithStats = await res.json();
        setPortfolio(data);
      } catch (err: any) {
        setError(err.message || '포트폴리오를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '포트폴리오를 찾을 수 없습니다'}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {portfolio.user?.name || '포트폴리오'}
              </h1>
              {portfolio.user?.email && (
                <p className="text-gray-600">{portfolio.user.email}</p>
              )}
            </div>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              ← 홈으로
            </Link>
          </div>
        </div>

        {/* 자기소개 */}
        {portfolio.bio && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              자기소개
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{portfolio.bio}</p>
          </div>
        )}

        {/* 기술 스택 */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              기술 스택
            </h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 주요 성과 */}
        {portfolio.achievements && portfolio.achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              주요 성과
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {portfolio.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 통계 */}
        {portfolio.stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              학습 통계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {portfolio.stats.total_logs}
                </p>
                <p className="text-gray-600 mt-1">총 학습 로그</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {portfolio.stats.total_days}
                </p>
                <p className="text-gray-600 mt-1">학습 일수</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {portfolio.stats.average_per_day}
                </p>
                <p className="text-gray-600 mt-1">일평균 로그</p>
              </div>
            </div>

            {/* 상위 태그 */}
            {portfolio.stats.top_tags && portfolio.stats.top_tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  자주 사용한 태그
                </h3>
                <div className="flex flex-wrap gap-2">
                  {portfolio.stats.top_tags.map((tagItem, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tagItem.tag} ({tagItem.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 최근 학습 기록 */}
        {portfolio.stats && portfolio.stats.recent_logs && portfolio.stats.recent_logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              최근 학습 기록
            </h2>
            <div className="space-y-4">
              {portfolio.stats.recent_logs.map((log) => (
                <div
                  key={log.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-gray-700">{log.content}</p>
                    <span className="text-sm text-gray-500 ml-4">
                      {log.log_date}
                    </span>
                  </div>
                  {log.tags && log.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {log.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

