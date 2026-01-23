-- Learning Logs 테이블에 tags 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

-- tags 컬럼 추가 (TEXT 배열)
ALTER TABLE public.learning_logs
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 인덱스 추가 (선택사항, 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_learning_logs_user_id ON public.learning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_logs_log_date ON public.learning_logs(log_date);

