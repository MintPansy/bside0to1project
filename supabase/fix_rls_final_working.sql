-- RLS 정책 무한 재귀 문제 최종 해결 (작동하는 버전)
-- 순환 참조를 완전히 제거합니다

-- ============================================
-- 1단계: 모든 기존 정책 완전 삭제
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('teams', 'team_members')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, 
            (SELECT tablename FROM pg_policies WHERE policyname = r.policyname LIMIT 1));
    END LOOP;
    RAISE NOTICE '모든 기존 정책이 삭제되었습니다.';
END $$;

-- 수동으로도 삭제 (확실하게)
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;

-- ============================================
-- 2단계: teams 테이블 정책 생성
-- ============================================
-- teams 정책은 team_members를 참조합니다
-- team_members 정책이 teams를 참조하지 않도록 주의해야 합니다

CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id 
      AND tm.user_id = auth.uid()
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
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'leader'
    )
  );

-- ============================================
-- 3단계: team_members 테이블 정책 생성 (핵심!)
-- ============================================
-- 무한 재귀를 방지하기 위해:
-- team_members 정책은 teams를 참조하되,
-- teams의 SELECT 정책이 평가되지 않도록 해야 합니다
-- 
-- 해결책: teams.created_by를 확인할 때,
-- teams 테이블의 SELECT 정책이 team_members를 참조하므로
-- team_members의 SELECT 정책이 평가되고,
-- 이것이 다시 teams를 참조하여 재귀가 발생합니다.
--
-- 최종 해결책: team_members 정책에서 teams를 참조하지 않고,
-- user_id만 확인하거나, SECURITY DEFINER 함수를 사용합니다.

-- 방법 1: 가장 간단한 버전 (자신의 멤버십만 확인)
CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십만 확인 (재귀 없음)
    user_id = auth.uid()
  );

-- 하지만 이것만으로는 팀 생성자가 멤버를 볼 수 없으므로,
-- SECURITY DEFINER 함수를 사용하여 teams.created_by를 확인합니다.

-- SECURITY DEFINER 함수 생성 (RLS 우회)
CREATE OR REPLACE FUNCTION public.is_team_creator(team_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM teams t
    WHERE t.id = team_id_param
    AND t.created_by = auth.uid()
  );
END;
$$;

-- 함수를 사용하는 정책
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십
    user_id = auth.uid() OR
    -- 팀 생성자는 모든 멤버를 볼 수 있음 (함수 사용으로 재귀 방지)
    public.is_team_creator(team_id)
  );

CREATE POLICY "Team leaders can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    -- 팀 생성자는 멤버 추가 가능 (함수 사용)
    public.is_team_creator(team_id) OR
    -- 리더는 멤버 추가 가능 (INSERT 시에는 재귀 없음)
    EXISTS (
      SELECT 1 
      FROM team_members tm_existing
      WHERE tm_existing.team_id = team_members.team_id
      AND tm_existing.user_id = auth.uid()
      AND tm_existing.role = 'leader'
    )
  );

-- ============================================
-- 4단계: 확인
-- ============================================
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members')
ORDER BY tablename, policyname;

