import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/health - 데이터베이스 연결 및 테이블 존재 여부 확인
export async function GET() {
  try {
    const supabase = await createClient();

    const checks: Record<string, boolean | string> = {};

    // 1. Supabase 연결 확인
    try {
      const { data: { session } } = await supabase.auth.getSession();
      checks.auth = session ? 'connected' : 'no session';
    } catch (error: any) {
      checks.auth = `error: ${error.message}`;
    }

    // 2. teams 테이블 확인
    try {
      const { error } = await supabase
        .schema('public')
        .from('teams')
        .select('id')
        .limit(1);
      
      if (error) {
        checks.teams = `error: ${error.message}`;
      } else {
        checks.teams = true;
      }
    } catch (error: any) {
      checks.teams = `error: ${error.message}`;
    }

    // 3. team_members 테이블 확인
    try {
      const { error } = await supabase
        .schema('public')
        .from('team_members')
        .select('id')
        .limit(1);
      
      if (error) {
        checks.team_members = `error: ${error.message}`;
      } else {
        checks.team_members = true;
      }
    } catch (error: any) {
      checks.team_members = `error: ${error.message}`;
    }

    // 4. users 테이블 확인
    try {
      const { error } = await supabase
        .schema('public')
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        checks.users = `error: ${error.message}`;
      } else {
        checks.users = true;
      }
    } catch (error: any) {
      checks.users = `error: ${error.message}`;
    }

    // 모든 테이블이 존재하는지 확인
    const allTablesExist = Object.values(checks).every(
      (check) => check === true || check === 'connected' || check === 'no session'
    );

    return NextResponse.json({
      status: allTablesExist ? 'healthy' : 'unhealthy',
      checks,
      message: allTablesExist
        ? '모든 테이블이 정상적으로 생성되었습니다.'
        : '일부 테이블이 없거나 접근할 수 없습니다. Supabase 대시보드에서 스키마를 실행했는지 확인해주세요.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error?.message || 'Unknown error',
        message: '헬스 체크 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

