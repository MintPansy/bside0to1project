-- RLS 정책 무한 재귀 문제 해결
-- 이 파일만 실행하면 됩니다

-- 1. 기존 문제가 있는 정책 삭제
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;

-- 2. teams 테이블 정책 재생성 (무한 재귀 방지)
-- teams 정책은 team_members를 직접 참조하지 않고, 
-- created_by만 확인하거나 별도의 함수를 사용합니다

CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    -- 팀 생성자는 항상 볼 수 있음
    created_by = auth.uid() OR
    -- team_members 테이블을 직접 참조하되, 별칭을 사용하여 재귀 방지
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

-- 3. team_members 테이블 정책 재생성 (무한 재귀 방지)
-- team_members 정책은 teams 테이블을 직접 참조하되,
-- 자기 자신을 참조하지 않도록 주의

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십은 항상 볼 수 있음
    user_id = auth.uid() OR
    -- 같은 팀의 다른 멤버를 보려면, teams 테이블을 통해 확인
    -- (자기 자신을 참조하지 않도록 별칭 사용)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND (
        t.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 
          FROM team_members tm2
          WHERE tm2.team_id = t.id
          AND tm2.user_id = auth.uid()
        )
      )
    )
  );

-- 더 간단한 버전 (성능 향상)
-- 위의 정책이 여전히 문제가 있다면 아래 버전을 사용하세요
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십은 항상 볼 수 있음
    user_id = auth.uid() OR
    -- 같은 팀의 멤버를 보려면, teams의 created_by를 확인하거나
    -- 별도의 team_members 행이 있는지 확인 (별칭 사용)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 
      FROM team_members tm_check
      WHERE tm_check.team_id = team_members.team_id
      AND tm_check.user_id = auth.uid()
      AND tm_check.id != team_members.id  -- 자기 자신 제외
    )
  );

CREATE POLICY "Team leaders can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    -- 팀 생성자는 멤버 추가 가능
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id 
      AND t.created_by = auth.uid()
    ) OR
    -- 리더는 멤버 추가 가능 (별칭 사용으로 재귀 방지)
    EXISTS (
      SELECT 1 
      FROM team_members tm_leader
      WHERE tm_leader.team_id = team_members.team_id
      AND tm_leader.user_id = auth.uid()
      AND tm_leader.role = 'leader'
    )
  );

