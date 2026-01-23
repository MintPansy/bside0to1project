# RLS (Row Level Security) 정책 문서

**프로젝트**: LearnTeam MVP  
**데이터베이스**: Supabase PostgreSQL  
**최종 업데이트**: 2025년 1월

---

## 📋 개요

이 문서는 LearnTeam 프로젝트의 모든 RLS 정책을 설명합니다. 각 테이블에 대한 정책은 보안과 사용자 권한을 명확히 정의합니다.

**중요**: 이 정책들은 `migration.sql` 실행 후 별도로 적용해야 합니다.

---

## 🔐 정책 적용 방법

1. Supabase Dashboard → SQL Editor 이동
2. 아래 정책들을 순서대로 복사하여 실행
3. 또는 `supabase/fix_rls_final_working.sql` 파일 사용 (무한 재귀 문제 해결 버전)

---

## 1. user_profiles 테이블

### 정책 목표
- 사용자는 자신의 프로필만 조회/수정 가능

### 정책

```sql
-- SELECT: 자신의 프로필만 조회
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

-- INSERT: 자신의 프로필만 생성
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE: 자신의 프로필만 수정
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);
```

---

## 2. teams 테이블

### 정책 목표
- 팀 생성자와 팀 멤버만 팀 정보 조회 가능
- 팀 생성자만 팀 생성/수정 가능

### 정책

```sql
-- SELECT: 팀 생성자 또는 팀 멤버만 조회
CREATE POLICY "Users can view teams they are members of"
ON public.teams FOR SELECT
USING (
  creator_id = auth.uid() OR
  EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = teams.id 
    AND tm.user_id = auth.uid()
  )
);

-- INSERT: 인증된 사용자는 팀 생성 가능
CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- UPDATE: 팀 생성자만 수정 가능
CREATE POLICY "Team creators can update teams"
ON public.teams FOR UPDATE
USING (creator_id = auth.uid());
```

---

## 3. team_members 테이블

### 정책 목표
- 팀 멤버만 멤버 목록 조회 가능
- 팀 생성자만 멤버 추가/제거 가능

### 정책

**주의**: 무한 재귀 문제를 방지하기 위해 SECURITY DEFINER 함수 사용

```sql
-- SECURITY DEFINER 함수 생성 (RLS 우회)
CREATE OR REPLACE FUNCTION public.is_team_creator(team_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.teams t
    WHERE t.id = team_id_param
    AND t.creator_id = auth.uid()
  );
END;
$$;

-- SELECT: 자신의 멤버십 또는 팀 생성자는 모든 멤버 조회
CREATE POLICY "Users can view members of their teams"
ON public.team_members FOR SELECT
USING (
  user_id = auth.uid() OR
  public.is_team_creator(team_id)
);

-- INSERT: 팀 생성자만 멤버 추가 가능
CREATE POLICY "Team creators can add members"
ON public.team_members FOR INSERT
WITH CHECK (public.is_team_creator(team_id));

-- DELETE: 팀 생성자만 멤버 제거 가능
CREATE POLICY "Team creators can remove members"
ON public.team_members FOR DELETE
USING (public.is_team_creator(team_id));
```

---

## 4. learning_logs 테이블

### 정책 목표
- 사용자는 자신의 학습 로그만 조회/수정/삭제 가능
- 팀원도 조회 가능 (선택사항)

### 정책

```sql
-- SELECT: 본인 또는 팀원만 읽기 가능
CREATE POLICY "Users can view own logs or team logs"
ON public.learning_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() IN (
    SELECT user_id FROM public.team_members
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = learning_logs.user_id
    )
  )
);

-- INSERT: 본인만 생성 가능
CREATE POLICY "Users can manage own logs"
ON public.learning_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인만 수정 가능
CREATE POLICY "Users can update own logs"
ON public.learning_logs FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: 본인만 삭제 가능
CREATE POLICY "Users can delete own logs"
ON public.learning_logs FOR DELETE
USING (auth.uid() = user_id);
```

---

## 5. team_logs 테이블

### 정책 목표
- 팀원만 팀 로그 조회/생성 가능

### 정책

```sql
-- SELECT: 팀원만 조회 가능
CREATE POLICY "Team members can view team logs"
ON public.team_logs FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- INSERT: 팀원만 생성 가능
CREATE POLICY "Team members can create team logs"
ON public.team_logs FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: 작성자만 수정 가능
CREATE POLICY "Users can update own team logs"
ON public.team_logs FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: 작성자만 삭제 가능
CREATE POLICY "Users can delete own team logs"
ON public.team_logs FOR DELETE
USING (auth.uid() = user_id);
```

---

## 6. curated_articles 테이블

### 정책 목표
- 공개 여부에 따라 접근 제어
- 작성자만 수정/삭제 가능

### 정책

```sql
-- SELECT: 공개된 글 또는 공유된 팀의 멤버만 조회
CREATE POLICY "Users can view public or shared articles"
ON public.curated_articles FOR SELECT
USING (
  is_public = TRUE OR
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
    AND team_id = ANY(shared_with_teams)
  )
);

-- INSERT: 인증된 사용자는 생성 가능
CREATE POLICY "Users can create articles"
ON public.curated_articles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 작성자만 수정 가능
CREATE POLICY "Users can update own articles"
ON public.curated_articles FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: 작성자만 삭제 가능
CREATE POLICY "Users can delete own articles"
ON public.curated_articles FOR DELETE
USING (auth.uid() = user_id);
```

---

## 7. comments 테이블

### 정책 목표
- 팀 로그에 대한 댓글은 팀원만 조회/생성 가능
- 작성자만 수정/삭제 가능

### 정책

```sql
-- SELECT: 팀원만 조회 가능
CREATE POLICY "Team members can view comments"
ON public.comments FOR SELECT
USING (
  team_log_id IN (
    SELECT id FROM public.team_logs
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- INSERT: 팀원만 댓글 작성 가능
CREATE POLICY "Team members can create comments"
ON public.comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  team_log_id IN (
    SELECT id FROM public.team_logs
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  )
);

-- UPDATE: 작성자만 수정 가능
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: 작성자만 삭제 가능
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);
```

---

## 🔍 정책 확인 방법

### Supabase Dashboard에서 확인

1. Supabase Dashboard → Authentication → Policies 이동
2. 각 테이블별로 정책이 생성되었는지 확인
3. 정책 이름과 조건 확인

### SQL로 확인

```sql
-- 모든 정책 조회
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## ⚠️ 주의사항

### 1. 무한 재귀 문제

`teams`와 `team_members` 테이블 간의 순환 참조로 인한 무한 재귀 문제가 발생할 수 있습니다.

**해결책**: SECURITY DEFINER 함수 사용 (`is_team_creator`)

### 2. 성능 최적화

복잡한 정책은 쿼리 성능에 영향을 줄 수 있습니다.

**권장사항**:
- 인덱스 생성 확인 (`migration.sql` 참고)
- 정책 조건 단순화
- 필요시 SECURITY DEFINER 함수 사용

### 3. 테스트

모든 정책 적용 후 다음을 테스트하세요:

- [ ] 사용자 프로필 CRUD
- [ ] 팀 생성 및 멤버 관리
- [ ] 학습 로그 CRUD
- [ ] 팀 로그 공유 및 댓글
- [ ] 권한 없는 접근 차단 확인

---

## 📚 참고 자료

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SECURITY DEFINER 함수](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**문서 작성일**: 2025년 1월  
**다음 단계**: 4단계 - 핵심 기능 구현

