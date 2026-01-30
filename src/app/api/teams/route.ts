import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SKIP_AUTH, DEMO_USER } from '@/lib/auth/demo'
import { getTeamsByUserId, createTeam, getTeamMembers } from '@/lib/store/local-db'
import { z } from 'zod'

const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요'),
  description: z.string().optional(),
})

// GET /api/teams - 현재 사용자가 속한 모든 팀 조회
export async function GET() {
  try {
    // 데모 모드: 로컬 DB 사용
    if (SKIP_AUTH) {
      const teams = getTeamsByUserId(DEMO_USER.id)
      const teamsWithMembers = teams.map(team => ({
        ...team,
        team_members: getTeamMembers(team.id),
      }))
      return NextResponse.json(teamsWithMembers)
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: teams, error } = await supabase
      .schema('public')
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/teams error:', error)
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        return NextResponse.json({
          error: '데이터베이스 테이블을 찾을 수 없습니다. Supabase 대시보드에서 supabase/schema.sql 파일을 실행했는지 확인해주세요.',
          details: error.message
        }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(teams || [])
  } catch (error: unknown) {
    console.error('GET /api/teams catch error:', error)
    return NextResponse.json({
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/teams - 팀 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTeamSchema.parse(body)

    // 데모 모드: 로컬 DB 사용
    if (SKIP_AUTH) {
      const team = createTeam({
        name: validatedData.name,
        description: validatedData.description,
        userId: DEMO_USER.id,
      })
      return NextResponse.json(team, { status: 201 })
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 팀 생성
    const { data: team, error: teamError } = await supabase
      .schema('public')
      .from('teams')
      .insert({
        name: validatedData.name,
        description: validatedData.description || null,
        owner_id: session.user.id,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (teamError) {
      console.error('POST /api/teams team creation error:', teamError)
      if (teamError.message.includes('does not exist') || teamError.message.includes('relation')) {
        return NextResponse.json({
          error: '데이터베이스 테이블을 찾을 수 없습니다.',
          details: teamError.message
        }, { status: 500 })
      }
      return NextResponse.json({ error: teamError.message }, { status: 500 })
    }

    // 팀 생성자를 leader로 team_members에 추가
    const { error: memberError } = await supabase
      .schema('public')
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        role: 'leader',
      })

    if (memberError) {
      console.error('POST /api/teams member creation error:', memberError)
      await supabase.schema('public').from('teams').delete().eq('id', team.id)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json(team, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/teams catch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
