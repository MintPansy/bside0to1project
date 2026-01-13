-- teams 테이블에 created_by 컬럼 추가
-- 이 파일을 먼저 실행하세요

-- 1. teams 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'teams'
ORDER BY ordinal_position;

-- 2. created_by 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'teams' 
        AND column_name = 'created_by'
    ) THEN
        -- created_by 컬럼 추가 (NULL 허용으로 먼저 추가)
        ALTER TABLE teams 
        ADD COLUMN created_by UUID;
        
        -- 기존 데이터 처리
        -- users 테이블의 첫 번째 사용자로 설정 (임시)
        -- 실제로는 적절한 사용자 ID로 변경해야 합니다
        UPDATE teams 
        SET created_by = (
            SELECT id FROM users ORDER BY created_at LIMIT 1
        )
        WHERE created_by IS NULL;
        
        -- 외래 키 제약 조건 추가
        ALTER TABLE teams 
        ADD CONSTRAINT teams_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
        
        -- NOT NULL 제약 조건 추가
        ALTER TABLE teams 
        ALTER COLUMN created_by SET NOT NULL;
        
        RAISE NOTICE 'created_by 컬럼이 성공적으로 추가되었습니다.';
    ELSE
        RAISE NOTICE 'created_by 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 3. 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'teams'
ORDER BY ordinal_position;

