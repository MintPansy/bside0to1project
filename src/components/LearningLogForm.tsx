'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FieldArrayPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createLogSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  what_learned: z.array(z.string()).min(1, '배운 점을 최소 1개 입력해주세요'),
  improvements: z.array(z.string()),
  next_steps: z.array(z.string()),
  tags: z.array(z.string()),
});

export type CreateLogFormData = z.infer<typeof createLogSchema>;

interface LearningLogFormProps {
  teamId?: string; // 팀 로그인 경우 teamId 필요
  onSubmit: (data: CreateLogFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<CreateLogFormData>;
  isLoading?: boolean;
}

export default function LearningLogForm({
  teamId,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: LearningLogFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLogFormData>({
    resolver: zodResolver(createLogSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      what_learned: initialData?.what_learned || [''],
      improvements: initialData?.improvements || [],
      next_steps: initialData?.next_steps || [],
      tags: initialData?.tags || [],
    },
  });

  const {
    fields: whatLearnedFields,
    append: appendWhatLearned,
    remove: removeWhatLearned,
  } = useFieldArray<CreateLogFormData>({
    control,
    name: 'what_learned' as FieldArrayPath<CreateLogFormData>,
  });

  const {
    fields: improvementsFields,
    append: appendImprovements,
    remove: removeImprovements,
  } = useFieldArray<CreateLogFormData>({
    control,
    name: 'improvements' as FieldArrayPath<CreateLogFormData>,
  });

  const {
    fields: nextStepsFields,
    append: appendNextSteps,
    remove: removeNextSteps,
  } = useFieldArray<CreateLogFormData>({
    control,
    name: 'next_steps' as FieldArrayPath<CreateLogFormData>,
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

  const onFormSubmit = async (data: CreateLogFormData) => {
    setError(null);

    // 빈 문자열 제거
    const cleanedData = {
      ...data,
      what_learned: data.what_learned.filter((item) => item.trim() !== ''),
      improvements: data.improvements?.filter((item) => item.trim() !== '') || [],
      next_steps: data.next_steps?.filter((item) => item.trim() !== '') || [],
    };

    try {
      await onSubmit(cleanedData);
    } catch (err: any) {
      setError(err.message || '로그 저장에 실패했습니다');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목 *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="예: REST API 설계 및 구현"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="상세 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배운 점 * (최소 1개)
          </label>
          {whatLearnedFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <input
                {...register(`what_learned.${index}`)}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="배운 점을 입력하세요"
              />
              {whatLearnedFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWhatLearned(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendWhatLearned('')}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + 추가
          </button>
          {errors.what_learned && (
            <p className="mt-1 text-sm text-red-600">{errors.what_learned.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            개선점
          </label>
          {improvementsFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <input
                {...register(`improvements.${index}`)}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="개선점을 입력하세요"
              />
              <button
                type="button"
                onClick={() => removeImprovements(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendImprovements('')}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + 추가
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            다음 스텝
          </label>
          {nextStepsFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <input
                {...register(`next_steps.${index}`)}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="다음 스텝을 입력하세요"
              />
              <button
                type="button"
                onClick={() => removeNextSteps(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendNextSteps('')}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + 추가
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그
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

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

