import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateLearningLogRequest } from '@/types/learning-log';

// POST /api/logs - 새 학습 로그 생성
export async function POST(request: NextRequest) {
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

    const body: CreateLearningLogRequest = await request.json();
    const { content, log_date, tags } = body;

    // 필수 필드 검증
    if (!content || !log_date) {
      return NextResponse.json(
        { error: 'content와 log_date는 필수입니다' },
        { status: 400 }
      );
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(log_date)) {
      return NextResponse.json(
        { error: 'log_date는 YYYY-MM-DD 형식이어야 합니다' },
        { status: 400 }
      );
    }

    // 학습 로그 생성
    const { data: log, error } = await supabase
      .from('personal_learning_logs')
      .insert({
        user_id: session.user.id,
        content,
        log_date,
        tags: tags && tags.length > 0 ? tags : null,
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/logs error:', error);
      return NextResponse.json(
        { error: error.message || '로그 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/logs catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET /api/logs - 사용자의 모든 학습 로그 조회
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

    // 로그인한 사용자의 로그만 조회 (날짜 역순 정렬)
    const { data: logs, error } = await supabase
      .from('personal_learning_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/logs error:', error);
      return NextResponse.json(
        { error: error.message || '로그 조회에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(logs || []);
  } catch (error: any) {
    console.error('GET /api/logs catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

