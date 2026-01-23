-- 개인 학습 로그 테이블 생성 및 수정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- 개인 학습 로그 기능을 위한 테이블 구조

-- 1. 기존 learning_logs 테이블이 팀 로그용인지 확인하고, 개인 로그용으로 변경하거나
--    별도 테이블을 생성합니다.

-- 옵션 1: 기존 learning_logs 테이블이 팀 로그용이라면, 개인 로그용 별도 테이블 생성
CREATE TABLE IF NOT EXISTS public.personal_learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_personal_learning_logs_user_id ON public.personal_learning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_learning_logs_log_date ON public.personal_learning_logs(log_date);

-- RLS 활성화
ALTER TABLE public.personal_learning_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 로그만 조회 가능
DROP POLICY IF EXISTS "Users can view their own personal logs" ON public.personal_learning_logs;
CREATE POLICY "Users can view their own personal logs"
  ON public.personal_learning_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 로그만 생성 가능
DROP POLICY IF EXISTS "Users can create their own personal logs" ON public.personal_learning_logs;
CREATE POLICY "Users can create their own personal logs"
  ON public.personal_learning_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 로그만 수정 가능
DROP POLICY IF EXISTS "Users can update their own personal logs" ON public.personal_learning_logs;
CREATE POLICY "Users can update their own personal logs"
  ON public.personal_learning_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 로그만 삭제 가능
DROP POLICY IF EXISTS "Users can delete their own personal logs" ON public.personal_learning_logs;
CREATE POLICY "Users can delete their own personal logs"
  ON public.personal_learning_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_personal_learning_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_personal_learning_logs_updated_at ON public.personal_learning_logs;
CREATE TRIGGER update_personal_learning_logs_updated_at
  BEFORE UPDATE ON public.personal_learning_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_personal_learning_logs_updated_at();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'Personal learning logs table created successfully!';
END $$;

