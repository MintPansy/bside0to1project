import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SKIP_AUTH } from '@/lib/auth/demo'
import { getTeamById, getPortfoliosByTeamId } from '@/lib/store/local-db'

// GET /api/teams/[teamId]/portfolio - 포트폴리오 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    // 데모 모드: 로컬 DB 사용
    if (SKIP_AUTH) {
      const team = getTeamById(teamId)
      if (!team) {
        return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
      }
      const portfolios = getPortfoliosByTeamId(teamId)
      return NextResponse.json(portfolios)
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: member } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single()

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    const { data: portfolios, error } = await supabase
      .schema('public')
      .from('portfolios')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(portfolios || [])
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
