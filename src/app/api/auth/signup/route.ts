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

    // 이메일 인증 사용 여부는 환경 변수로 제어
    // 개발 환경에서는 자동 확인, 프로덕션에서는 이메일 인증 필요
    const requireEmailConfirmation = process.env.REQUIRE_EMAIL_CONFIRMATION === 'true';
    
    let authData: any;
    let authError: any;

    if (requireEmailConfirmation) {
      // 일반 signUp - 이메일 인증 링크 전송
      const cookieStore = await cookies();
      const routeHandlerClient = createRouteHandlerClient({ cookies: () => cookieStore });
      
      const signUpResult = await routeHandlerClient.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email`,
          data: {
            name: validatedData.name,
          },
        },
      });
      
      authData = signUpResult.data;
      authError = signUpResult.error;
    } else {
      // Admin createUser - 자동 확인 (개발 환경)
      const supabase = createSupabaseAdminClient();
      const adminResult = await supabase.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true,
        user_metadata: {
          name: validatedData.name,
        },
      });
      authData = { data: { user: adminResult.data?.user } };
      authError = adminResult.error;
    }

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData || !authData.user) {
      return NextResponse.json(
        { error: '사용자 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    // Create user profile in users table
    // Admin client는 Service Role Key를 사용하므로 RLS를 자동으로 우회합니다
    // 트리거 함수가 자동으로 생성할 수도 있으므로, 먼저 트리거를 기다립니다
    const supabase = createSupabaseAdminClient();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 트리거가 자동으로 생성했는지 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!existingUser) {
      // 트리거가 작동하지 않았으므로 수동으로 삽입
      // Admin client는 RLS를 우회하므로 직접 삽입 가능
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: validatedData.email,
          name: validatedData.name,
        });

      if (profileError) {
        // 테이블이 존재하지 않거나 스키마 문제
        console.error('Profile creation error:', profileError);
        if (!requireEmailConfirmation) {
          await supabase.auth.admin.deleteUser(authData.user.id);
        }
        return NextResponse.json(
          { 
            error: '프로필 생성에 실패했습니다: ' + profileError.message + 
            '. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.' 
          },
          { status: 500 }
        );
      }
    }

    // 이메일 인증이 필요한 경우 세션을 생성하지 않음
    if (requireEmailConfirmation) {
      // signUp을 사용한 경우 세션이 없을 수 있음
      if (!authData.session) {
        return NextResponse.json({
          user: authData.user,
          requiresEmailConfirmation: true,
          message: '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
        });
      }
    }

    // 세션이 있으면 그대로 사용 (이메일 인증이 완료된 경우)
    if (authData.session) {
      return NextResponse.json({
        user: authData.user,
        session: authData.session,
      });
    }

    // 세션이 없으면 로그인하여 세션 생성 (자동 확인된 경우)
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
      session: sessionData.session,
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
