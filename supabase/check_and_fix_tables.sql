-- teams 테이블 구조 확인 및 수정
-- 이 파일을 먼저 실행하여 테이블 구조를 확인하세요

-- 1. teams 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'teams'
ORDER BY ordinal_position;

-- 2. created_by 컬럼이 없으면 추가
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
        ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE CASCADE;
        
        -- 기존 데이터가 있다면 현재 사용자로 설정 (임시)
        -- 실제로는 기존 데이터를 확인하고 적절한 값으로 설정해야 합니다
        UPDATE teams 
        SET created_by = (
            SELECT id FROM users LIMIT 1
        )
        WHERE created_by IS NULL;
        
        -- NOT NULL 제약 조건 추가
        ALTER TABLE teams 
        ALTER COLUMN created_by SET NOT NULL;
        
        RAISE NOTICE 'created_by 컬럼이 추가되었습니다.';
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

