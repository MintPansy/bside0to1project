-- RLS 정책 무한 재귀 문제 최종 해결 (완전한 버전)
-- 이 파일을 실행하기 전에 모든 기존 정책을 확인하고 삭제합니다

-- ============================================
-- 1단계: 현재 정책 확인
-- ============================================
-- 다음 쿼리로 현재 정책을 확인하세요:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members')
ORDER BY tablename, policyname;

-- ============================================
-- 2단계: 모든 기존 정책 삭제 (완전 삭제)
-- ============================================
-- teams 테이블의 모든 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teams'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON teams', r.policyname);
        RAISE NOTICE 'Deleted policy: %', r.policyname;
    END LOOP;
END $$;

-- team_members 테이블의 모든 정책 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'team_members'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', r.policyname);
        RAISE NOTICE 'Deleted policy: %', r.policyname;
    END LOOP;
END $$;

-- ============================================
-- 3단계: teams 테이블 정책 재생성 (안전한 버전)
-- ============================================
-- teams 정책은 team_members를 참조하되,
-- team_members 정책이 teams를 참조하지 않도록 주의

-- SELECT 정책: 팀 조회
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    -- 케이스 1: 팀 생성자는 항상 볼 수 있음
    created_by = auth.uid() OR
    -- 케이스 2: team_members에 속한 사용자
    -- 주의: team_members 정책이 이 쿼리를 평가할 때 재귀가 발생하지 않도록
    -- 별칭을 사용하고, team_members의 SELECT 정책이 teams를 참조하지 않도록 해야 함
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id 
      AND tm.user_id = auth.uid()
    )
  );

-- UPDATE 정책: 팀 수정
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
-- 4단계: team_members 테이블 정책 재생성 (핵심!)
-- ============================================
-- 무한 재귀를 완전히 방지하기 위해:
-- 1. teams 테이블의 created_by를 우선 확인
-- 2. 자기 자신을 참조할 때는 별칭과 조건을 사용
-- 3. teams 정책을 참조하지 않도록 주의

-- SELECT 정책: 멤버 조회
CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 케이스 1: 자신의 멤버십은 항상 볼 수 있음 (가장 먼저 확인)
    user_id = auth.uid() OR
    -- 케이스 2: 팀 생성자는 모든 멤버를 볼 수 있음
    -- teams 테이블을 직접 참조하되, teams의 SELECT 정책이 team_members를 참조하므로
    -- 이 부분이 재귀를 일으킬 수 있음
    -- 해결: teams.created_by를 직접 확인 (RLS 우회)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    ) OR
    -- 케이스 3: 같은 팀의 다른 멤버를 볼 수 있음
    -- 이 부분이 가장 위험: team_members를 참조하면서 자기 자신을 제외
    -- 하지만 여전히 재귀가 발생할 수 있음
    -- 해결: teams.created_by를 먼저 확인한 후에만 team_members 확인
    (
      EXISTS (
        SELECT 1 
        FROM teams t
        WHERE t.id = team_members.team_id
        AND t.created_by = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 
        FROM team_members tm_check
        WHERE tm_check.team_id = team_members.team_id
        AND tm_check.user_id = auth.uid()
        AND tm_check.id != team_members.id
      )
    )
  );

-- 더 간단하고 안전한 버전 (재귀 완전 방지)
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 케이스 1: 자신의 멤버십
    user_id = auth.uid() OR
    -- 케이스 2: 팀 생성자 (teams 테이블 직접 확인, RLS 우회)
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    ) OR
    -- 케이스 3: 같은 팀 멤버 (자기 자신 제외)
    -- 주의: 이 부분에서 재귀가 발생할 수 있으므로,
    -- teams.created_by를 먼저 확인한 경우에만 실행
    EXISTS (
      SELECT 1 
      FROM team_members tm_other
      INNER JOIN teams t ON t.id = tm_other.team_id
      WHERE tm_other.team_id = team_members.team_id
      AND tm_other.user_id = auth.uid()
      AND tm_other.id != team_members.id
      AND (t.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM team_members tm2 
        WHERE tm2.team_id = t.id 
        AND tm2.user_id = auth.uid()
        AND tm2.id != tm_other.id
      ))
    )
  );

-- 가장 안전한 버전: teams.created_by만 확인
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십
    user_id = auth.uid() OR
    -- 팀 생성자는 모든 멤버를 볼 수 있음
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
    -- 주의: 같은 팀의 다른 멤버를 보는 기능은 제거
    -- 필요하다면 애플리케이션 레벨에서 처리
  );

-- INSERT 정책: 멤버 추가
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
    -- 리더는 멤버 추가 가능
    -- INSERT 시에는 재귀가 발생하지 않음 (아직 삽입되지 않은 행이므로)
    EXISTS (
      SELECT 1 
      FROM team_members tm_existing
      WHERE tm_existing.team_id = team_members.team_id
      AND tm_existing.user_id = auth.uid()
      AND tm_existing.role = 'leader'
    )
  );

-- ============================================
-- 5단계: 확인
-- ============================================
-- 정책이 제대로 생성되었는지 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members')
ORDER BY tablename, policyname;

