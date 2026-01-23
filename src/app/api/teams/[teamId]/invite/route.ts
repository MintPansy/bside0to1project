import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// 무작위 초대 코드 생성
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/teams/[teamId]/invite - 초대 링크 생성
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
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

    const { teamId } = params;

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
        { error: '팀 리더만 초대 링크를 생성할 수 있습니다' },
        { status: 403 }
      );
    }

    // 기존 초대 코드가 있는지 확인 (만료되지 않은 것)
    const { data: existingInvite } = await supabase
      .schema('public')
      .from('team_invites')
      .select('*')
      .eq('team_id', teamId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingInvite) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.json({
        inviteCode: existingInvite.invite_code,
        inviteLink: `${baseUrl}/teams/join?code=${existingInvite.invite_code}`,
        expiresAt: existingInvite.expires_at,
      });
    }

    // 새 초대 코드 생성
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    const { data: invite, error } = await supabase
      .schema('public')
      .from('team_invites')
      .insert({
        team_id: teamId,
        invite_code: inviteCode,
        created_by: session.user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      inviteCode: invite.invite_code,
      inviteLink: `${baseUrl}/teams/join?code=${invite.invite_code}`,
      expiresAt: invite.expires_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

