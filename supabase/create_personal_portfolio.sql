-- 개인 포트폴리오 테이블 생성
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS public.personal_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  portfolio_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_personal_portfolios_user_id ON public.personal_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_portfolios_slug ON public.personal_portfolios(portfolio_slug);
CREATE INDEX IF NOT EXISTS idx_personal_portfolios_is_public ON public.personal_portfolios(is_public);

-- RLS 활성화
ALTER TABLE public.personal_portfolios ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 포트폴리오를 조회/수정 가능
DROP POLICY IF EXISTS "Users can view their own portfolio" ON public.personal_portfolios;
CREATE POLICY "Users can view their own portfolio"
  ON public.personal_portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 공개된 포트폴리오는 누구나 조회 가능
DROP POLICY IF EXISTS "Anyone can view public portfolios" ON public.personal_portfolios;
CREATE POLICY "Anyone can view public portfolios"
  ON public.personal_portfolios FOR SELECT
  USING (is_public = TRUE);

-- users 테이블: 공개 포트폴리오가 있는 사용자의 정보는 누구나 조회 가능
-- (기존 정책과 함께 작동하므로 추가만 함)
DROP POLICY IF EXISTS "Anyone can view users with public portfolios" ON public.users;
CREATE POLICY "Anyone can view users with public portfolios"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.personal_portfolios
      WHERE personal_portfolios.user_id = users.id
      AND personal_portfolios.is_public = TRUE
    )
  );

-- RLS 정책: 사용자는 자신의 포트폴리오를 생성 가능
DROP POLICY IF EXISTS "Users can create their own portfolio" ON public.personal_portfolios;
CREATE POLICY "Users can create their own portfolio"
  ON public.personal_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 포트폴리오를 수정 가능
DROP POLICY IF EXISTS "Users can update their own portfolio" ON public.personal_portfolios;
CREATE POLICY "Users can update their own portfolio"
  ON public.personal_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_personal_portfolios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_personal_portfolios_updated_at ON public.personal_portfolios;
CREATE TRIGGER update_personal_portfolios_updated_at
  BEFORE UPDATE ON public.personal_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_personal_portfolios_updated_at();

-- portfolio_slug 자동 생성 함수 (사용자 가입 시 또는 첫 포트폴리오 생성 시)
CREATE OR REPLACE FUNCTION public.generate_portfolio_slug(user_uuid UUID, user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- 이메일에서 username 추출 (예: user@example.com -> user)
  base_slug := lower(split_part(user_email, '@', 1));
  
  -- 특수 문자 제거 및 하이픈으로 변환
  base_slug := regexp_replace(base_slug, '[^a-z0-9]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- 고유한 slug 생성
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.personal_portfolios WHERE portfolio_slug = final_slug AND user_id != user_uuid) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

