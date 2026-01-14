'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const joinTeamSchema = z.object({
  code: z.string().min(1, '초대 코드를 입력해주세요'),
});

type JoinTeamFormData = z.infer<typeof joinTeamSchema>;

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema),
  });

  useEffect(() => {
    // URL 파라미터에서 초대 코드 가져오기
    const code = searchParams.get('code');
    if (code) {
      setValue('code', code);
      // 초대 코드로 팀 정보 조회 (선택적)
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: JoinTeamFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '팀 가입에 실패했습니다');
        setIsLoading(false);
        return;
      }

      // 성공 시 팀 페이지로 리다이렉트
      router.push(`/teams/${result.teamId}`);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            팀 가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            초대 코드를 입력하여 팀에 가입하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {teamInfo && (
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">{teamInfo.name}</p>
              {teamInfo.description && (
                <p className="text-sm text-blue-700 mt-1">{teamInfo.description}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              초대 코드
            </label>
            <input
              {...register('code')}
              type="text"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="ABC123XYZ"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <JoinTeamContent />
    </Suspense>
  );
}

