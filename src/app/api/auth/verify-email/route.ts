import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/auth/verify-email - 이메일 인증 확인
// URL 파라미터로 token을 받아서 이메일 인증 처리
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 이메일 인증 처리
    // Supabase 이메일 인증 링크는 token과 type을 URL 파라미터로 전달
    const { data, error } = await supabase.auth.verifyOtp({
      token: token,
      type: type === 'recovery' ? 'recovery' : 'signup',
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: '인증에 실패했습니다' },
        { status: 400 }
      );
    }

    // 인증 성공 시 대시보드로 리다이렉트
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

