import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const updatePortfolioSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  is_public: z.boolean().optional(),
});

// GET /api/teams/[teamId]/portfolio/[portfolioId] - 포트폴리오 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; portfolioId: string }> }
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

    const { teamId, portfolioId } = await params;

    // 포트폴리오 조회
    const { data: portfolio, error } = await supabase
      .schema('public')
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('team_id', teamId)
      .single();

    if (error || !portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

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

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[teamId]/portfolio/[portfolioId] - 포트폴리오 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; portfolioId: string }> }
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

    const { teamId, portfolioId } = await params;
    const body = await request.json();
    const validatedData = updatePortfolioSchema.parse(body);

    // 포트폴리오 조회
    const { data: portfolio } = await supabase
      .schema('public')
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('team_id', teamId)
      .single();

    if (!portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없습니다' },
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

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 리더만 포트폴리오를 수정할 수 있습니다' },
        { status: 403 }
      );
    }

    // 포트폴리오 수정
    const { data: updatedPortfolio, error } = await supabase
      .schema('public')
      .from('portfolios')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolioId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId]/portfolio/[portfolioId] - 포트폴리오 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; portfolioId: string }> }
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

    const { teamId, portfolioId } = await params;

    // 포트폴리오 조회
    const { data: portfolio } = await supabase
      .schema('public')
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('team_id', teamId)
      .single();

    if (!portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없습니다' },
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

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 리더만 포트폴리오를 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 포트폴리오 삭제
    const { error } = await supabase
      .schema('public')
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);

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

