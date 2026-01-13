-- RLS 정책 무한 재귀 문제 최종 해결
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1단계: 기존 문제가 있는 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;

-- ============================================
-- 2단계: teams 테이블 정책 재생성
-- ============================================
-- teams 정책은 team_members를 참조하되, 
-- team_members 정책이 teams를 참조하지 않도록 주의

CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    -- 팀 생성자는 항상 볼 수 있음
    created_by = auth.uid() OR
    -- team_members 테이블을 참조 (별칭 사용)
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id 
      AND tm.user_id = auth.uid()
    )
  );

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
-- 3단계: team_members 테이블 정책 재생성 (핵심!)
-- ============================================
-- 무한 재귀 방지: teams 테이블을 우선 확인하고,
-- 자기 자신을 참조할 때는 별칭과 조건을 사용

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 케이스 1: 자신의 멤버십은 항상 볼 수 있음
    user_id = auth.uid() OR
    -- 케이스 2: 같은 팀의 다른 멤버를 보려면, 
    -- teams 테이블의 created_by를 먼저 확인 (순환 참조 방지)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    ) OR
    -- 케이스 3: 같은 팀의 멤버인 경우 (자기 자신 제외)
    -- 이 부분이 핵심: 별칭을 사용하고 자기 자신을 제외하여 재귀 방지
    EXISTS (
      SELECT 1 
      FROM team_members tm_other
      WHERE tm_other.team_id = team_members.team_id
      AND tm_other.user_id = auth.uid()
      AND tm_other.id != team_members.id  -- 자기 자신 제외 (재귀 방지)
    )
  );

CREATE POLICY "Team leaders can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    -- 케이스 1: 팀 생성자는 멤버 추가 가능 (teams 테이블 직접 확인)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id 
      AND t.created_by = auth.uid()
    ) OR
    -- 케이스 2: 리더는 멤버 추가 가능
    -- 주의: INSERT 시에는 아직 삽입되지 않은 행이므로,
    -- 기존 team_members 행만 확인 (재귀 없음)
    EXISTS (
      SELECT 1 
      FROM team_members tm_existing
      WHERE tm_existing.team_id = team_members.team_id
      AND tm_existing.user_id = auth.uid()
      AND tm_existing.role = 'leader'
    )
  );

-- ============================================
-- 4단계: 확인 쿼리
-- ============================================
-- 다음 쿼리로 정책이 제대로 생성되었는지 확인하세요:
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('teams', 'team_members')
-- ORDER BY tablename, policyname;

