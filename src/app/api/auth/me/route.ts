import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// GET /api/auth/me - 현재 사용자 정보 조회
export async function GET() {
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

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

