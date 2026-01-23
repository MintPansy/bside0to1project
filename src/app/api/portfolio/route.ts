import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpdatePortfolioRequest } from '@/types/portfolio';

// GET /api/portfolio - 내 포트폴리오 조회
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

    // 사용자의 포트폴리오 조회
    const { data: portfolio, error } = await supabase
      .from('personal_portfolios')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      // 포트폴리오가 없는 경우 null 반환 (에러 아님)
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      
      console.error('GET /api/portfolio error:', error);
      return NextResponse.json(
        { error: error.message || '포트폴리오 조회에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error: any) {
    console.error('GET /api/portfolio catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio - 포트폴리오 생성/수정
export async function PUT(request: NextRequest) {
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

    const body: UpdatePortfolioRequest = await request.json();
    const { bio, skills, achievements, is_public } = body;

    // 기존 포트폴리오 확인
    const { data: existingPortfolio } = await supabase
      .from('personal_portfolios')
      .select('id, portfolio_slug')
      .eq('user_id', session.user.id)
      .single();

    // 사용자 정보 가져오기 (slug 생성용)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json(
        { error: '사용자 정보를 가져올 수 없습니다' },
        { status: 500 }
      );
    }

    // slug 생성 함수 호출 (Supabase 함수 사용)
    let portfolio_slug = existingPortfolio?.portfolio_slug;
    if (!portfolio_slug) {
      // 이메일에서 username 추출
      const baseSlug = user.email.split('@')[0].toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // 고유한 slug 확인
      let finalSlug = baseSlug;
      let counter = 0;
      while (true) {
        const { data: checkSlug } = await supabase
          .from('personal_portfolios')
          .select('id')
          .eq('portfolio_slug', finalSlug)
          .maybeSingle();
        
        if (!checkSlug || checkSlug.id === existingPortfolio?.id) {
          break;
        }
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }
      portfolio_slug = finalSlug;
    }

    const updateData: any = {
      user_id: session.user.id,
      portfolio_slug,
      updated_at: new Date().toISOString(),
    };

    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills || [];
    if (achievements !== undefined) updateData.achievements = achievements || [];
    if (is_public !== undefined) updateData.is_public = is_public;

    let portfolio;
    if (existingPortfolio) {
      // 업데이트
      const { data, error } = await supabase
        .from('personal_portfolios')
        .update(updateData)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('PUT /api/portfolio update error:', error);
        return NextResponse.json(
          { error: error.message || '포트폴리오 수정에 실패했습니다' },
          { status: 500 }
        );
      }

      portfolio = data;
    } else {
      // 생성
      const { data, error } = await supabase
        .from('personal_portfolios')
        .insert({
          ...updateData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('PUT /api/portfolio create error:', error);
        return NextResponse.json(
          { error: error.message || '포트폴리오 생성에 실패했습니다' },
          { status: 500 }
        );
      }

      portfolio = data;
    }

    return NextResponse.json(portfolio);
  } catch (error: any) {
    console.error('PUT /api/portfolio catch error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

