import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const joinTeamSchema = z.object({
  code: z.string().min(1, '초대 코드를 입력해주세요'),
});

// POST /api/teams/join - 팀 가입
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = joinTeamSchema.parse(body);

    // 초대 코드로 초대 정보 조회
    const { data: invite, error: inviteError } = await supabase
      .schema('public')
      .from('team_invites')
      .select('*, teams(*)')
      .eq('invite_code', validatedData.code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 초대 코드입니다' },
        { status: 400 }
      );
    }

    // 이미 팀 멤버인지 확인
    const { data: existingMember } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', invite.team_id)
      .eq('user_id', session.user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: '이미 팀 멤버입니다', teamId: invite.team_id },
        { status: 400 }
      );
    }

    // 팀 멤버로 추가
    const { data: member, error: memberError } = await supabase
      .schema('public')
      .from('team_members')
      .insert({
        team_id: invite.team_id,
        user_id: session.user.id,
        role: 'member',
      })
      .select()
      .single();

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teamId: invite.team_id,
      team: invite.teams,
    });
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

