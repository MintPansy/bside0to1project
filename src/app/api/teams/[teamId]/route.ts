import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';

const updateTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요').optional(),
  description: z.string().optional(),
});

// GET /api/teams/[teamId] - 팀 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
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

    const { teamId } = params;

    // 팀 정보 조회
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 사용자가 팀 멤버인지 확인
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    if (!member && team.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 팀원 목록 조회
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('team_id', teamId);

    // 학습 로그 통계 (지난 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: logCount } = await supabase
      .from('learning_logs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('created_at', sevenDaysAgo.toISOString());

    return NextResponse.json({
      team,
      members: members || [],
      stats: {
        memberCount: members?.length || 0,
        logCountLast7Days: logCount || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[teamId] - 팀 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
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

    const { teamId } = params;
    const body = await request.json();
    const validatedData = updateTeamSchema.parse(body);

    // 팀 정보 조회
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 팀 리더인지 확인
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .eq('role', 'leader')
      .single();

    if (!member && team.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 리더만 수정할 수 있습니다' },
        { status: 403 }
      );
    }

    // 팀 수정
    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTeam);
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

// DELETE /api/teams/[teamId] - 팀 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
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

    const { teamId } = params;

    // 팀 정보 조회
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 팀 생성자인지 확인
    if (team.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 생성자만 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 팀 삭제 (CASCADE로 관련 데이터도 삭제됨)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

