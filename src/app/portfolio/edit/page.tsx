'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import type { PersonalPortfolio, UpdatePortfolioRequest } from '@/types/portfolio';

const portfolioSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

export default function PortfolioEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      bio: '',
      skills: [],
      achievements: [],
      is_public: false,
    },
  });

  const skills = watch('skills') || [];
  const achievements = watch('achievements') || [];
  const isPublic = watch('is_public');

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          // 포트폴리오가 없는 경우도 정상 (새로 생성)
          setLoading(false);
          return;
        }
        const data: PersonalPortfolio = await res.json();
        reset({
          bio: data.bio || '',
          skills: data.skills || [],
          achievements: data.achievements || [],
          is_public: data.is_public || false,
        });
      } catch (err: any) {
        setError(err.message || '포트폴리오를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [router, reset]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkills = [...skills, skillInput.trim()];
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setValue('skills', newSkills);
  };

  const handleAddAchievement = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && achievementInput.trim()) {
      e.preventDefault();
      const newAchievements = [...achievements, achievementInput.trim()];
      setValue('achievements', newAchievements);
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    setValue('achievements', newAchievements);
  };

  const onSubmit = async (data: PortfolioFormData) => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const updateData: UpdatePortfolioRequest = {
        bio: data.bio || undefined,
        skills: data.skills || [],
        achievements: data.achievements || [],
        is_public: data.is_public || false,
      };

      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '포트폴리오 저장에 실패했습니다');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/portfolio');
      }, 1500);
    } catch (err: any) {
      setError(err.message || '포트폴리오 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              포트폴리오 {success ? '저장 완료!' : '수정'}
            </h1>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-gray-900"
            >
              ← 돌아가기
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ 포트폴리오가 성공적으로 저장되었습니다!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 자기소개 */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                자기소개
              </label>
              <textarea
                {...register('bio')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="자신을 소개해주세요..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            {/* 기술 스택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기술 스택
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="기술을 입력하고 Enter를 누르세요 (예: React, TypeScript)"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 주요 성과 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주요 성과
              </label>
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={handleAddAchievement}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="성과를 입력하고 Enter를 누르세요"
              />
              <ul className="list-disc list-inside space-y-1 mt-2">
                {achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center text-gray-700"
                  >
                    <span>{achievement}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 공개 여부 */}
            <div className="flex items-center">
              <input
                {...register('is_public')}
                type="checkbox"
                id="is_public"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_public"
                className="ml-2 block text-sm text-gray-700"
              >
                포트폴리오 공개하기 (공개 시 다른 사용자도 볼 수 있습니다)
              </label>
            </div>

            {isPublic && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  💡 포트폴리오가 공개되면{' '}
                  <code className="bg-blue-100 px-1 rounded">/portfolio/[slug]</code> URL로
                  누구나 접근할 수 있습니다.
                </p>
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/portfolio"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

