import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';

const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요'),
  description: z.string().optional(),
});

// GET /api/teams - 현재 사용자가 속한 모든 팀 조회
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient();
    
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
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(user_id, role)
      `)
      .or(`created_by.eq.${session.user.id},team_members.user_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.' 
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(teams || []);
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST /api/teams - 팀 생성
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient();
    
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
      .from('teams')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (teamError) {
      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (teamError.message.includes('schema cache') || teamError.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.' 
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: teamError.message },
        { status: 500 }
      );
    }

    // 팀 생성자를 leader로 team_members에 추가
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        role: 'leader',
      });

    if (memberError) {
      // 팀 생성은 성공했지만 멤버 추가 실패 시 팀 삭제
      await supabase.from('teams').delete().eq('id', team.id);
      
      // 테이블이 없는 경우 더 명확한 에러 메시지 제공
      if (memberError.message.includes('schema cache') || memberError.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.' 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

