'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LearningLogForm from '@/components/PersonalLearningLogForm';
import type { LearningLog } from '@/types/learning-log';

interface PersonalLearningLogSectionProps {
  userId: string;
}

export default function PersonalLearningLogSection({ userId }: PersonalLearningLogSectionProps) {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 로그 목록 조회
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          setError('로그를 불러올 수 없습니다');
          return;
        }
        const data = await response.json();
        setLogs(data.slice(0, 5)); // 최근 5개만 표시
      } catch (err) {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
      setLogs((prev) => [newLog, ...prev].slice(0, 5)); // 최근 5개만 유지
      setShowForm(false);
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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">개인 학습 로그</h2>
          <p className="text-gray-600 text-sm mt-1">오늘 배운 내용을 기록하세요</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + 새 로그
            </button>
          )}
          <Link
            href="/logs"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            전체 보기
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 새 로그 작성 폼 */}
      {showForm && (
        <div className="mb-6">
          <LearningLogForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 최근 로그 목록 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>아직 작성한 학습 로그가 없습니다.</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              첫 로그 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {formatDate(log.log_date)}
                </span>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3 whitespace-pre-wrap">
                {log.content}
              </p>
              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

