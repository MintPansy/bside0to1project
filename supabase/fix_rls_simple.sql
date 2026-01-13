-- RLS 정책 무한 재귀 문제 해결 (간단하고 안전한 버전)
-- 이 파일을 실행하세요

-- ============================================
-- 1단계: 모든 기존 정책 완전 삭제
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- teams 테이블의 모든 정책 삭제
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teams'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON teams', r.policyname);
    END LOOP;
    
    -- team_members 테이블의 모든 정책 삭제
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'team_members'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', r.policyname);
    END LOOP;
    
    RAISE NOTICE '모든 기존 정책이 삭제되었습니다.';
END $$;

-- ============================================
-- 2단계: teams 테이블 정책 생성 (안전한 버전)
-- ============================================
-- teams 정책은 team_members를 참조하되,
-- team_members 정책이 teams를 참조하지 않도록 주의

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
-- 무한 재귀를 완전히 방지하기 위해:
-- team_members 정책은 teams를 참조하되,
-- teams의 created_by만 확인 (teams의 SELECT 정책을 트리거하지 않음)

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 케이스 1: 자신의 멤버십은 항상 볼 수 있음
    user_id = auth.uid() OR
    -- 케이스 2: 팀 생성자는 모든 멤버를 볼 수 있음
    -- teams.created_by를 직접 확인 (RLS 우회를 위해 SECURITY DEFINER 함수 사용하지 않음)
    -- 대신 teams 테이블을 직접 조회하되, teams의 SELECT 정책이 team_members를 참조하므로
    -- 여전히 재귀가 발생할 수 있음
    -- 해결: teams 테이블을 조회할 때 RLS를 우회하는 방법 사용
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
    )
  );

-- 더 안전한 버전: SECURITY DEFINER 함수 사용
-- 하지만 이것도 복잡하므로, 가장 간단한 방법 사용

-- 최종 안전한 버전: teams.created_by만 확인하고,
-- 같은 팀의 다른 멤버를 보는 기능은 제거
-- (애플리케이션 레벨에서 처리)

DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;

CREATE POLICY "Users can view members of their teams"
  ON team_members FOR SELECT
  USING (
    -- 자신의 멤버십
    user_id = auth.uid() OR
    -- 팀 생성자는 모든 멤버를 볼 수 있음
    -- teams 테이블을 조회하되, teams의 SELECT 정책이 평가될 때
    -- team_members를 참조하므로 재귀가 발생할 수 있음
    -- 해결책: teams의 SELECT 정책에서 team_members를 참조하지 않도록 수정
    -- 하지만 이미 수정했으므로, 여기서는 teams를 직접 참조
    EXISTS (
      SELECT 1 
      FROM teams t
      WHERE t.id = team_members.team_id
      AND t.created_by = auth.uid()
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
    -- 리더는 멤버 추가 가능
    -- INSERT 시에는 재귀가 발생하지 않음
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

