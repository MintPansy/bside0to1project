'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import LearningLogForm from '@/components/PersonalLearningLogForm';
import type { LearningLog } from '@/types/learning-log';

function LogsPageContent() {
  const router = useRouter();
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 확인 및 로그 목록 조회
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
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
  }, [router]);

  // 날짜별로 그룹화
  const groupedLogs = logs.reduce((acc, log) => {
    const date = log.log_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, LearningLog[]>);

  // 날짜 역순 정렬
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  const handleSubmit = async (data: { content: string; log_date: string; tags?: string[] }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '로그 저장에 실패했습니다');
      }

      const newLog = await response.json();
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setError(err.message || '로그 저장에 실패했습니다');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">학습 로그</h1>
          <p className="text-gray-600">오늘 배운 내용을 기록하고 관리하세요</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 새 로그 작성 폼 */}
        <div className="mb-8">
          <LearningLogForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>

        {/* 로그 목록 */}
        <div className="space-y-8">
          {sortedDates.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">아직 작성한 학습 로그가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">위의 폼을 사용하여 첫 번째 로그를 작성해보세요!</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  {formatDate(date)}
                </h2>
                <div className="space-y-4">
                  {groupedLogs[date].map((log) => (
                    <div
                      key={log.id}
                      className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{log.content}</p>
                      </div>
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {log.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 text-xs text-gray-500">
                        작성 시간: {new Date(log.created_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <ProtectedRoute>
      <LogsPageContent />
    </ProtectedRoute>
  );
}

