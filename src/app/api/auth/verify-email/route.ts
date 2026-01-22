import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = createClient();

    // 이메일 인증 처리
    // Supabase 이메일 인증 링크는 token_hash를 사용합니다
    const otpType = type === 'recovery' ? 'recovery' : 'signup';
    
    // token_hash를 사용하는 방식 (이메일 인증 링크에서 사용)
    // VerifyTokenHashParams 타입 사용
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: otpType,
    } as { token_hash: string; type: 'signup' | 'recovery' });

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

