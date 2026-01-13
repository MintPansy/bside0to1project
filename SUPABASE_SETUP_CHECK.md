# Supabase 스키마 설정 확인 가이드

## 문제 해결: "데이터베이스 테이블을 찾을 수 없습니다"

이 오류가 발생하면 다음 단계를 따라주세요:

## 1단계: Supabase 대시보드 접속

1. https://supabase.com 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

## 2단계: 스키마 파일 실행

1. 프로젝트의 `supabase/schema.sql` 파일을 열기
2. **전체 내용**을 복사
3. Supabase SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭 (또는 Ctrl+Enter)

## 3단계: 테이블 생성 확인

1. 좌측 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ `users`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `learning_logs`
   - ✅ `portfolios`
   - ✅ `curated_links`

## 4단계: RLS 정책 확인

1. **Table Editor**에서 각 테이블 클릭
2. **Policies** 탭 확인
3. 각 테이블에 RLS 정책이 있는지 확인

## 5단계: 환경 변수 확인

`.env.local` 파일에 다음이 모두 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6단계: 서버 재시작

```bash
# 서버 종료 (Ctrl+C)
# 서버 재시작
npm run dev
```

## 7단계: 브라우저 새로고침

- **하드 리프레시**: Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)

## 문제가 계속되면

### 터미널 에러 확인

서버를 실행한 터미널에서 빨간색 에러 메시지를 확인하세요.

### Supabase 연결 테스트

SQL Editor에서 다음 쿼리를 실행해보세요:

```sql
SELECT * FROM teams LIMIT 1;
```

이 쿼리가 실행되면 테이블이 정상적으로 생성된 것입니다.

### RLS 정책 재생성

만약 테이블은 있지만 접근이 안 된다면, `supabase/schema.sql`의 RLS 정책 부분만 다시 실행하세요.

## 자주 묻는 질문

**Q: 스키마를 여러 번 실행해도 되나요?**
A: 네, `CREATE TABLE IF NOT EXISTS`를 사용했으므로 안전합니다.

**Q: 기존 데이터가 삭제되나요?**
A: 아니요, 기존 데이터는 유지됩니다.

**Q: 에러가 발생하면?**
A: SQL Editor에서 에러 메시지를 확인하고, 구체적인 에러 내용을 공유해주세요.

