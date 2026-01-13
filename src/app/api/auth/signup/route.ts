import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { cookies } from 'next/headers';

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    const supabase = createSupabaseAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        name: validatedData.name,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '사용자 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: validatedData.email,
        name: validatedData.name,
      });

    if (profileError) {
      // If profile creation fails, try to delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: '프로필 생성에 실패했습니다: ' + profileError.message },
        { status: 500 }
      );
    }

    // Sign in the user using route handler client to set cookies
    const cookieStore = await cookies();
    const routeHandlerClient = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: sessionData, error: sessionError } = await routeHandlerClient.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        { error: '세션 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: authData.user,
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

