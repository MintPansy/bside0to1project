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
  created_by: string;
  users?: {
    name: string;
    email: string;
  };
}

export default function TeamLogsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}/logs?sort=recent`);
        if (!response.ok) {
          setError('로그를 불러올 수 없습니다');
          return;
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [teamId]);

  const handleDelete = async (logId: string) => {
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

      // 목록 새로고침
      setLogs(logs.filter((log) => log.id !== logId));
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
            <h1 className="text-3xl font-bold text-gray-900">학습 로그</h1>
            <Link
              href={`/teams/${teamId}/logs/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              새 로그 작성
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {logs.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">아직 작성된 로그가 없습니다.</p>
              <Link
                href={`/teams/${teamId}/logs/new`}
                className="text-blue-600 hover:text-blue-800"
              >
                첫 로그를 작성해보세요!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/teams/${teamId}/logs/${log.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {log.title}
                    </h3>
                    {log.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {log.description}
                      </p>
                    )}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">배운 점:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {log.what_learned.slice(0, 2).map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                        {log.what_learned.length > 2 && (
                          <li className="text-gray-400">
                            +{log.what_learned.length - 2}개 더
                          </li>
                        )}
                      </ul>
                    </div>
                    {log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {log.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{log.users?.name || '알 수 없음'}</span>
                      <span>{new Date(log.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </Link>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link
                      href={`/teams/${teamId}/logs/${log.id}/edit`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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
