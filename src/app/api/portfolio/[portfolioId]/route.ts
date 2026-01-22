import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/portfolio/[portfolioId] - 공개 포트폴리오 조회 (인증 불필요)
export async function GET(
  request: NextRequest,
  { params }: { params: { portfolioId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient();
    
    const { portfolioId } = params;

    // 포트폴리오 조회
    const { data: portfolio, error } = await supabase
      .schema('public')
      .from('portfolios')
      .select(`
        *,
        teams (
          id,
          name,
          description
        )
      `)
      .eq('id', portfolioId)
      .eq('is_public', true)
      .single();

    if (error || !portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없거나 공개되지 않았습니다' },
        { status: 404 }
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

