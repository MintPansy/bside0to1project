import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PortfolioWithStats } from '@/types/portfolio';

// GET /api/portfolio/[slug] - 공개 포트폴리오 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // 공개된 포트폴리오 조회 (로그인 없이도 접근 가능)
    const { data: portfolio, error: portfolioError } = await supabase
      .from('personal_portfolios')
      .select('*')
      .eq('portfolio_slug', slug)
      .eq('is_public', true)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, avatar_url')
      .eq('id', portfolio.user_id)
      .single();

    if (userError) {
      console.error('GET /api/portfolio/[slug] user error:', userError);
    }

    // 학습 로그 통계 조회
    const { data: logs } = await supabase
      .from('personal_learning_logs')
      .select('id, content, log_date, tags')
      .eq('user_id', portfolio.user_id)
      .order('log_date', { ascending: false });

    const logsArray = logs || [];
    const total_logs = logsArray.length;
    const uniqueDates = new Set(logsArray.map(log => log.log_date));
    const total_days = uniqueDates.size;
    const average_per_day = total_days > 0 ? Number((total_logs / total_days).toFixed(2)) : 0;

    // 최근 30일 로그
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent_logs = logsArray
      .filter(log => new Date(log.log_date) >= thirtyDaysAgo)
      .slice(0, 10)
      .map(log => ({
        id: log.id,
        content: log.content,
        log_date: log.log_date,
        tags: log.tags || [],
      }));

    // 태그 통계
    const tagCounts: Record<string, number> = {};
    logsArray.forEach(log => {
      if (log.tags && Array.isArray(log.tags)) {
        log.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const top_tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const portfolioWithStats: PortfolioWithStats = {
      ...portfolio,
      stats: {
        total_logs,
        total_days,
        average_per_day,
        recent_logs,
        top_tags,
      },
      user: userData || undefined,
    };

    return NextResponse.json(portfolioWithStats);
  } catch (error: any) {
    console.error('GET /api/portfolio/[slug] catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

