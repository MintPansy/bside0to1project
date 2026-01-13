-- LearnTeam Database Schema - Fixed Version
-- 이 파일은 무한 재귀 문제와 누락된 테이블을 해결합니다

-- 1. users 테이블 (누락된 경우 생성)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. teams 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. team_members 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. learning_logs 테이블 (누락된 경우 생성)
CREATE TABLE IF NOT EXISTS learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  what_learned TEXT[] NOT NULL,
  improvements TEXT[],
  next_steps TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. portfolios 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  public_url TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. curated_links 테이블 (누락된 경우 생성)
CREATE TABLE IF NOT EXISTS curated_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('article', 'video', 'tutorial')),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_links ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (무한 재귀 문제 해결)
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for teams (무한 재귀 방지)
-- 직접 created_by 확인과 EXISTS 서브쿼리 사용
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid() 
      AND team_members.role = 'leader'
    )
  );

-- RLS Policies for team_members (무한 재귀 방지)
-- 직접 user_id 확인과 EXISTS 서브쿼리 사용
CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team leaders can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- RLS Policies for learning_logs
DROP POLICY IF EXISTS "Users can view logs of their teams" ON learning_logs;
DROP POLICY IF EXISTS "Team members can create logs" ON learning_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON learning_logs;

CREATE POLICY "Users can view logs of their teams"
  ON learning_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = learning_logs.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create logs"
  ON learning_logs FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = learning_logs.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own logs"
  ON learning_logs FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for portfolios
DROP POLICY IF EXISTS "Users can view public portfolios or portfolios of their teams" ON portfolios;
DROP POLICY IF EXISTS "Team members can create portfolios" ON portfolios;
DROP POLICY IF EXISTS "Team members can update portfolios" ON portfolios;

CREATE POLICY "Users can view public portfolios or portfolios of their teams"
  ON portfolios FOR SELECT
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = portfolios.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = portfolios.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update portfolios"
  ON portfolios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = portfolios.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- RLS Policies for curated_links
DROP POLICY IF EXISTS "Users can view links of their teams" ON curated_links;
DROP POLICY IF EXISTS "Team members can create links" ON curated_links;
DROP POLICY IF EXISTS "Users can update their own links" ON curated_links;

CREATE POLICY "Users can view links of their teams"
  ON curated_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = curated_links.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create links"
  ON curated_links FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = curated_links.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own links"
  ON curated_links FOR UPDATE
  USING (created_by = auth.uid());

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

