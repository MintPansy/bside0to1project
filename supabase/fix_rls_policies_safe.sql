-- RLS 정책 무한 재귀 문제 해결 (안전한 버전)
-- teams 테이블에 created_by 컬럼이 있는지 먼저 확인하세요

-- ============================================
-- 1단계: teams 테이블 구조 확인
-- ============================================
-- 다음 쿼리로 teams 테이블의 컬럼을 확인하세요:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'teams';

-- ============================================
-- 2단계: created_by 컬럼이 없으면 추가
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'teams' 
        AND column_name = 'created_by'
    ) THEN
        -- created_by 컬럼 추가
        ALTER TABLE teams 
        ADD COLUMN created_by UUID;
        
        -- 외래 키 제약 조건 추가 (users 테이블이 존재하는 경우)
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        ) THEN
            ALTER TABLE teams 
            ADD CONSTRAINT teams_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        -- 기존 데이터 처리 (첫 번째 사용자로 설정)
        UPDATE teams 
        SET created_by = (SELECT id FROM users LIMIT 1)
        WHERE created_by IS NULL;
        
        -- NOT NULL 제약 조건 추가
        ALTER TABLE teams 
        ALTER COLUMN created_by SET NOT NULL;
        
        RAISE NOTICE 'created_by 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'created_by 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- ============================================
-- 3단계: 기존 문제가 있는 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;

-- ============================================
-- 4단계: teams 테이블 정책 재생성
-- ============================================
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    -- 팀 생성자는 항상 볼 수 있음 (created_by 컬럼 확인)
    (SELECT created_by FROM teams WHERE id = teams.id) = auth.uid() OR
    -- team_members 테이블을 참조 (별칭 사용)
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = teams.id 
      AND tm.user_id = auth.uid()
    )
  );

-- 더 간단한 버전 (created_by 직접 참조)
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;

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
-- 5단계: team_members 테이블 정책 재생성 (핵심!)
-- ============================================
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

