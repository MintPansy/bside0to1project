# LearnTeam 설정 가이드

## 1. Supabase 스키마 설정

### 문제: "Could not find the table 'public.users' in the schema cache"

이 오류는 Supabase 데이터베이스에 테이블이 생성되지 않았을 때 발생합니다.

### 해결 방법:

1. **Supabase 대시보드 접속**
   - https://supabase.com 에서 프로젝트 선택
   - 좌측 메뉴에서 "SQL Editor" 클릭

2. **스키마 실행**
   - `supabase/schema.sql` 파일의 전체 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭하여 실행

3. **추가 스키마 실행** (팀 초대 기능 사용 시)
   - `supabase/schema_additions.sql` 파일의 내용도 실행

4. **확인**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `users`, `teams`, `team_members`, `learning_logs`, `portfolios`, `curated_links` 테이블이 생성되었는지 확인

### 중요: RLS 정책

스키마에는 Row Level Security (RLS) 정책이 포함되어 있습니다. 
`users` 테이블에 INSERT 정책이 추가되었으므로, 회원가입 시 프로필이 자동으로 생성됩니다.

## 2. 이미지 파일 설정

### learnteam_image.webp 추가

1. 프로젝트 루트에 있는 `learnteam_image.webp` 파일을 `public` 폴더로 이동:
   ```
   public/learnteam_image.webp
   ```

2. 또는 이미지가 다른 위치에 있다면:
   - `public` 폴더에 이미지 파일 복사
   - 파일명: `learnteam_image.webp` (또는 `.png`, `.jpg` 등)

3. 이미지가 없어도 페이지는 정상 작동합니다 (이미지가 숨겨짐)

## 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 패키지 설치

```bash
npm install
```

## 5. 개발 서버 실행

```bash
npm run dev
```

## 문제 해결

### 여전히 "users 테이블을 찾을 수 없습니다" 오류가 발생하는 경우:

1. Supabase 대시보드에서 테이블이 실제로 생성되었는지 확인
2. SQL Editor에서 다음 쿼리로 확인:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'users';
   ```
3. 테이블이 없다면 `supabase/schema.sql`을 다시 실행
4. RLS 정책이 올바르게 설정되었는지 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### 이미지가 표시되지 않는 경우:

1. `public` 폴더에 이미지 파일이 있는지 확인
2. 파일명이 정확한지 확인 (대소문자 구분)
3. 브라우저 개발자 도구의 Network 탭에서 404 오류 확인
4. Next.js 개발 서버 재시작

