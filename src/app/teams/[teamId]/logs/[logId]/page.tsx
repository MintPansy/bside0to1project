'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface LearningLog {
  id: string;
  title: string;
  description?: string;
  what_learned: string[];
  improvements?: string[];
  next_steps?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  users?: {
    name: string;
    email: string;
  };
}

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const logId = params.logId as string;

  const [log, setLog] = useState<LearningLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 현재 사용자 정보 조회
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const user = await userResponse.json();
          setCurrentUserId(user.id);
        }

        // 로그 상세 조회
        const logResponse = await fetch(`/api/teams/${teamId}/logs/${logId}`);
        if (!logResponse.ok) {
          setError('로그를 찾을 수 없습니다');
          return;
        }
        const logData = await logResponse.json();
        setLog(logData);
      } catch (err) {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId, logId]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 로그를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/logs/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('로그 삭제에 실패했습니다');
        return;
      }

      router.push(`/teams/${teamId}/logs`);
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

  if (error || !log) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">{error || '로그를 찾을 수 없습니다'}</h1>
          <Link
            href={`/teams/${teamId}/logs`}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = log.created_by === currentUserId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link
                href={`/teams/${teamId}/logs`}
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← 로그 목록으로
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{log.title}</h1>
            </div>
            {isAuthor && (
              <div className="flex space-x-2">
                <Link
                  href={`/teams/${teamId}/logs/${logId}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            {log.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">설명</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{log.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">배운 점</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {log.what_learned.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {log.improvements && log.improvements.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">개선점</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {log.improvements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {log.next_steps && log.next_steps.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">다음 스텝</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {log.next_steps.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {log.tags && log.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">태그</h2>
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                작성자: {log.users?.name || '알 수 없음'} ({log.users?.email})
              </p>
              <p className="text-sm text-gray-500">
                작성일: {new Date(log.created_at).toLocaleString('ko-KR')}
              </p>
              {log.updated_at !== log.created_at && (
                <p className="text-sm text-gray-500">
                  수정일: {new Date(log.updated_at).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

