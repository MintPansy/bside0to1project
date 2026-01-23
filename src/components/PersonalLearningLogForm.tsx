'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateLearningLogRequest } from '@/types/learning-log';

const learningLogSchema = z.object({
  content: z.string().min(1, '학습 내용을 입력해주세요'),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  tags: z.array(z.string()).optional(),
});

type LearningLogFormData = z.infer<typeof learningLogSchema>;

interface LearningLogFormProps {
  onSubmit: (data: CreateLearningLogRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function LearningLogForm({ onSubmit, isLoading = false }: LearningLogFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // 오늘 날짜를 기본값으로 설정 (YYYY-MM-DD 형식)
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LearningLogFormData>({
    resolver: zodResolver(learningLogSchema),
    defaultValues: {
      content: '',
      log_date: today,
      tags: [],
    },
  });

  const tags = watch('tags') || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...tags, tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setValue('tags', newTags);
  };

  const onFormSubmit = async (data: LearningLogFormData) => {
    setError(null);
    setSuccess(false);

    try {
      await onSubmit({
        content: data.content,
        log_date: data.log_date,
        tags: data.tags || [],
      });
      setSuccess(true);
      reset();
      setTagInput('');
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || '로그 저장에 실패했습니다');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">새 학습 로그 작성</h2>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">✅ 학습 로그가 성공적으로 저장되었습니다!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="log_date" className="block text-sm font-medium text-gray-700 mb-1">
            날짜 *
          </label>
          <input
            {...register('log_date')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.log_date && (
            <p className="mt-1 text-sm text-red-600">{errors.log_date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            학습 내용 *
          </label>
          <textarea
            {...register('content')}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="오늘 배운 내용을 자유롭게 작성해주세요..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그 (선택사항)
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

