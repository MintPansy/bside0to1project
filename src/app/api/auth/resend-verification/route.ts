import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
});

// POST /api/auth/resend-verification - 이메일 인증 재전송
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resendSchema.parse(body);

    const supabase = createClient();

    // 이메일 인증 재전송
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: validatedData.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: '인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.',
    });
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

