# LearnTeam 설정 가이드

## 문제 해결

### 1. "Could not find the table 'public.users' in the schema cache" 오류

**원인**: Supabase 데이터베이스에 테이블이 생성되지 않았습니다.

**해결 방법**:

1. Supabase 대시보드 접속 (https://supabase.com)
2. 프로젝트 선택 → 좌측 메뉴 "SQL Editor" 클릭
3. `supabase/schema.sql` 파일의 **전체 내용**을 복사하여 SQL Editor에 붙여넣기
4. "Run" 버튼 클릭하여 실행
5. 팀 초대 기능을 사용할 경우 `supabase/schema_additions.sql`도 실행

**확인 방법**:
- Table Editor에서 다음 테이블들이 생성되었는지 확인:
  - `users`
  - `teams`
  - `team_members`
  - `learning_logs`
  - `portfolios`
  - `curated_links`
  - `team_invites` (팀 초대 기능 사용 시)

**중요**: 
- 스키마에는 RLS (Row Level Security) 정책이 포함되어 있습니다
- `users` 테이블에 INSERT 정책이 추가되어 있어 회원가입 시 프로필이 자동 생성됩니다
- 트리거 함수 `handle_new_user()`가 자동으로 프로필을 생성합니다

### 2. 랜딩 페이지 이미지 추가

**이미지 파일 위치**:
- 프로젝트 루트에 있는 `learnteam_image.webp` 파일을 `public` 폴더로 복사하세요
- 경로: `public/learnteam_image.webp`

**수동 설정**:
1. 프로젝트 루트에 `public` 폴더가 없으면 생성
2. `learnteam_image.webp` 파일을 `public` 폴더로 복사
3. Next.js 개발 서버 재시작

**이미지가 없어도 페이지는 정상 작동합니다** (이미지가 표시되지 않음)

## 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 추가 문제 해결

### 여전히 users 테이블 오류가 발생하는 경우:

1. Supabase SQL Editor에서 테이블 존재 확인:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'users';
   ```

2. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. 트리거 함수 확인:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

4. 모든 것이 정상인데도 오류가 발생하면, Supabase 프로젝트를 재시작하거나 캐시를 클리어해보세요.

