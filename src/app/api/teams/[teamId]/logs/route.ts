import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';

const createLogSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  what_learned: z.array(z.string()).min(1, '배운 점을 최소 1개 입력해주세요'),
  improvements: z.array(z.string()).optional(),
  next_steps: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/teams/[teamId]/logs - 학습 로그 목록 조회
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
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'recent';

    // 사용자가 팀 멤버인지 확인
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    const { data: team } = await supabase
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
    let query = supabase
      .from('learning_logs')
      .select(`
        *,
        users:created_by (
          id,
          name,
          email
        )
      `)
      .eq('team_id', teamId);

    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(logs || []);
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[teamId]/logs - 학습 로그 생성
export async function POST(
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
    const validatedData = createLogSchema.parse(body);

    // 사용자가 팀 멤버인지 확인
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 멤버만 로그를 작성할 수 있습니다' },
        { status: 403 }
      );
    }

    // 학습 로그 생성
    const { data: log, error } = await supabase
      .from('learning_logs')
      .insert({
        team_id: teamId,
        created_by: session.user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        what_learned: validatedData.what_learned,
        improvements: validatedData.improvements || [],
        next_steps: validatedData.next_steps || [],
        tags: validatedData.tags || [],
      })
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

    return NextResponse.json(log, { status: 201 });
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

