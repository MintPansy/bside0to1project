'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Portfolio {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  is_public: boolean;
  public_url?: string;
  created_at: string;
  updated_at: string;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const portfolioId = params.portfolioId as string;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
    checkLeader();
  }, [teamId, portfolioId]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/${portfolioId}`);
      if (!response.ok) {
        setError('포트폴리오를 찾을 수 없습니다');
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

  const checkLeader = async () => {
    try {
      const teamResponse = await fetch(`/api/teams/${teamId}`);
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const currentUserResponse = await fetch('/api/auth/me');
        if (currentUserResponse.ok) {
          const currentUser = await currentUserResponse.json();
          const currentMember = teamData.members.find(
            (m: any) => m.user_id === currentUser.id
          );
          setIsLeader(
            currentMember?.role === 'leader' || teamData.team.created_by === currentUser.id
          );
        }
      }
    } catch (err) {
      console.error('Error checking leader status:', err);
    }
  };

  const handleTogglePublic = async () => {
    if (!portfolio) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: !portfolio.is_public }),
      });

      if (!response.ok) {
        alert('공개 상태 변경에 실패했습니다');
        return;
      }

      await fetchPortfolio();
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (portfolio?.public_url) {
      navigator.clipboard.writeText(portfolio.public_url);
      alert('공개 링크가 복사되었습니다');
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('정말로 포트폴리오를 다시 생성하시겠습니까? 현재 내용은 덮어씌워집니다.')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/portfolio/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        alert('포트폴리오 재생성에 실패했습니다');
        return;
      }

      const result = await response.json();
      router.push(`/teams/${teamId}/portfolio/${result.id}`);
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
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

      router.push(`/teams/${teamId}/portfolio`);
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

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">{error || '포트폴리오를 찾을 수 없습니다'}</h1>
          <Link
            href={`/teams/${teamId}/portfolio`}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            포트폴리오 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link
                href={`/teams/${teamId}/portfolio`}
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← 포트폴리오 목록으로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{portfolio.title}</h1>
            </div>
            {isLeader && (
              <div className="flex space-x-2">
                <button
                  onClick={handleTogglePublic}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg transition ${
                    portfolio.is_public
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {portfolio.is_public ? '비공개로' : '공개로'}
                </button>
                {portfolio.public_url && (
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    링크 복사
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-8 mb-6">
            <div className="prose max-w-none">
              {portfolio.content ? (
                <ReactMarkdown>{portfolio.content}</ReactMarkdown>
              ) : (
                <p className="text-gray-600">포트폴리오 내용이 없습니다.</p>
              )}
            </div>
          </div>

          {isLeader && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRegenerate}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                다시 생성
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                삭제
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>생성일: {new Date(portfolio.created_at).toLocaleString('ko-KR')}</p>
            {portfolio.updated_at !== portfolio.created_at && (
              <p>수정일: {new Date(portfolio.updated_at).toLocaleString('ko-KR')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

