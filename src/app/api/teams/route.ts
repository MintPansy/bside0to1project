import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요'),
  description: z.string().optional(),
});

// GET /api/teams - 현재 사용자가 속한 모든 팀 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 현재 사용자가 속한 팀 조회
    // RLS 정책에 의해 자동으로 필터링됨
    const { data: teams, error } = await supabase
      .schema('public')
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/teams error:', error);
      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (error.message.includes('schema cache') || error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
        return NextResponse.json(
          {
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.',
            details: error.message
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message, details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(teams || []);
  } catch (error: any) {
    console.error('GET /api/teams catch error:', error);
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/teams - 팀 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // 팀 생성
    const { data: team, error: teamError } = await supabase
      .schema('public')
      .from('teams')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        owner_id: session.user.id,  // 팀 소유자 (NOT NULL 필수)
        created_by: session.user.id,  // 생성자
      })
      .select()
      .single();

    if (teamError) {
      console.error('POST /api/teams team creation error:', teamError);
      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (teamError.message.includes('schema cache') || teamError.message.includes('does not exist') || teamError.message.includes('relation') || teamError.message.includes('table')) {
        return NextResponse.json(
          {
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.',
            details: teamError.message
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: teamError.message, details: teamError.message },
        { status: 500 }
      );
    }

    // 팀 생성자를 leader로 team_members에 추가
    const { error: memberError } = await supabase
      .schema('public')
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        role: 'leader',
      });

    if (memberError) {
      console.error('POST /api/teams member creation error:', memberError);
      // 팀 생성은 성공했지만 멤버 추가 실패 시 팀 삭제
      try {
        await supabase.schema('public').from('teams').delete().eq('id', team.id);
      } catch (deleteError) {
        console.error('Failed to delete team after member error:', deleteError);
      }

      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (memberError.message.includes('schema cache') || memberError.message.includes('does not exist') || memberError.message.includes('relation') || memberError.message.includes('table')) {
        return NextResponse.json(
          {
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.',
            details: memberError.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: memberError.message, details: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/teams catch error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

