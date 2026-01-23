import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// DELETE /api/teams/[teamId]/members/[memberId] - 팀원 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const cookieStore = await cookies();
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

    const { teamId, memberId } = await params;

    // 팀 정보 조회
    const { data: team } = await supabase
      .schema('public')
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
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .eq('role', 'leader')
      .single();

    if (!member && team.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 리더만 팀원을 제거할 수 있습니다' },
        { status: 403 }
      );
    }

    // 제거할 멤버 정보 확인
    const { data: targetMember } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: '팀원을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 리더는 제거할 수 없음
    if (targetMember.role === 'leader') {
      return NextResponse.json(
        { error: '리더는 제거할 수 없습니다' },
        { status: 400 }
      );
    }

    // 팀원 제거
    const { error } = await supabase
      .schema('public')
      .from('team_members')
      .delete()
      .eq('id', memberId);

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

