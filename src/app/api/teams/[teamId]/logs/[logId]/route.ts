import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const updateLogSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  description: z.string().optional(),
  what_learned: z.array(z.string()).min(1).optional(),
  improvements: z.array(z.string()).optional(),
  next_steps: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/teams/[teamId]/logs/[logId] - 학습 로그 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string; logId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { teamId, logId } = params;

    // 사용자가 팀 멤버인지 확인
    const { data: member } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다' },
        { status: 403 }
      );
    }

    // 학습 로그 조회
    const { data: log, error } = await supabase
      .schema('public')
      .from('learning_logs')
      .select(`
        *,
        users:created_by (
          id,
          name,
          email
        )
      `)
      .eq('id', logId)
      .eq('team_id', teamId)
      .single();

    if (error || !log) {
      return NextResponse.json(
        { error: '로그를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[teamId]/logs/[logId] - 학습 로그 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string; logId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { teamId, logId } = params;
    const body = await request.json();
    const validatedData = updateLogSchema.parse(body);

    // 학습 로그 조회
    const { data: log } = await supabase
      .schema('public')
      .from('learning_logs')
      .select('*')
      .eq('id', logId)
      .eq('team_id', teamId)
      .single();

    if (!log) {
      return NextResponse.json(
        { error: '로그를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 작성자만 수정 가능
    if (log.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '작성자만 수정할 수 있습니다' },
        { status: 403 }
      );
    }

    // 학습 로그 수정
    const { data: updatedLog, error } = await supabase
      .schema('public')
      .from('learning_logs')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', logId)
      .select(`
        *,
        users:created_by (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedLog);
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

// DELETE /api/teams/[teamId]/logs/[logId] - 학습 로그 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string; logId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { teamId, logId } = params;

    // 학습 로그 조회
    const { data: log } = await supabase
      .schema('public')
      .from('learning_logs')
      .select('*')
      .eq('id', logId)
      .eq('team_id', teamId)
      .single();

    if (!log) {
      return NextResponse.json(
        { error: '로그를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 작성자만 삭제 가능
    if (log.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '작성자만 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 학습 로그 삭제
    const { error } = await supabase
      .schema('public')
      .from('learning_logs')
      .delete()
      .eq('id', logId);

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

