import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PortfolioStats } from '@/types/portfolio';

// GET /api/learning-logs/summary - 사용자의 학습 로그 통계
export async function GET(request: NextRequest) {
  try {
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

    // 사용자의 모든 학습 로그 조회
    const { data: logs, error: logsError } = await supabase
      .from('personal_learning_logs')
      .select('id, content, log_date, tags')
      .eq('user_id', session.user.id)
      .order('log_date', { ascending: false });

    if (logsError) {
      console.error('GET /api/learning-logs/summary error:', logsError);
      return NextResponse.json(
        { error: logsError.message || '로그 조회에 실패했습니다' },
        { status: 500 }
      );
    }

    const logsArray = logs || [];

    // 통계 계산
    const total_logs = logsArray.length;
    
    // 고유한 날짜 개수 계산
    const uniqueDates = new Set(logsArray.map(log => log.log_date));
    const total_days = uniqueDates.size;
    
    // 일평균 계산
    const average_per_day = total_days > 0 ? Number((total_logs / total_days).toFixed(2)) : 0;

    // 최근 30일 로그 (최대 10개)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = logsArray
      .filter(log => new Date(log.log_date) >= thirtyDaysAgo)
      .slice(0, 10)
      .map(log => ({
        id: log.id,
        content: log.content,
        log_date: log.log_date,
        tags: log.tags || [],
      }));

    // 태그 통계 계산
    const tagCounts: Record<string, number> = {};
    logsArray.forEach(log => {
      if (log.tags && Array.isArray(log.tags)) {
        log.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // 상위 태그 정렬 (최대 10개)
    const top_tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const stats: PortfolioStats = {
      total_logs,
      total_days,
      average_per_day,
      recent_logs,
      top_tags,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('GET /api/learning-logs/summary catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

