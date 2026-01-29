-- Anonymous 사용자 지원을 위한 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. Anonymous 사용자도 공개 포트폴리오 조회 가능 (이미 is_public = true로 처리됨)
-- 추가 정책 불필요

-- 2. Anonymous 사용자를 위한 users 테이블 정책 추가
-- (Anonymous 로그인 시 프로필 생성 허용)
DROP POLICY IF EXISTS "Anonymous users can insert their profile" ON users;
CREATE POLICY "Anonymous users can insert their profile"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() = id AND
    (auth.jwt() ->> 'is_anonymous')::boolean = true
  );

-- 3. handle_new_user 함수 업데이트 (Anonymous 사용자 처리)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Anonymous 사용자는 users 테이블에 삽입하지 않음
  -- (나중에 계정 연결 시 삽입)
  IF NEW.is_anonymous = true THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Anonymous 사용자가 팀 목록을 볼 수 없도록 명시 (보안)
-- 기존 정책이 auth.uid()를 체크하므로 Anonymous도 자신의 팀만 볼 수 있음
-- 추가 정책 불필요

-- 5. Supabase Auth에서 Anonymous 로그인 활성화 필요
-- Dashboard > Authentication > Providers > Anonymous Sign-Ins 활성화

COMMENT ON POLICY "Anonymous users can insert their profile" ON users IS
  'Anonymous 사용자가 나중에 계정을 연결할 때 프로필 생성 허용';
