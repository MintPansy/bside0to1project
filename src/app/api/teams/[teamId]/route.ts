import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SKIP_AUTH, DEMO_USER } from '@/lib/auth/demo'
import { getTeamById, getTeamMembers, getLearningLogsByTeamId, localDb } from '@/lib/store/local-db'
import { z } from 'zod'

const updateTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요').optional(),
  description: z.string().optional(),
})

// GET /api/teams/[teamId] - 팀 정보 조회
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

      const members = getTeamMembers(teamId)
      const logs = getLearningLogsByTeamId(teamId)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentLogs = logs.filter(l => new Date(l.created_at) >= sevenDaysAgo)

      return NextResponse.json({
        team,
        members: members.map(m => ({
          ...m,
          users: m.user ? { id: m.user.id, name: m.user.name, email: m.user.email, avatar_url: m.user.avatar_url } : null
        })),
        stats: {
          memberCount: members.length,
          logCountLast7Days: recentLogs.length,
        },
      })
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: team, error: teamError } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
    }

    const { data: member } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single()

    if (!member && team.created_by !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    const { data: members } = await supabase
      .schema('public')
      .from('team_members')
      .select(`*, users:user_id (id, name, email, avatar_url)`)
      .eq('team_id', teamId)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: logCount } = await supabase
      .schema('public')
      .from('learning_logs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('created_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      team,
      members: members || [],
      stats: {
        memberCount: members?.length || 0,
        logCountLast7Days: logCount || 0,
      },
    })
  } catch (error) {
    console.error('GET /api/teams/[teamId] error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// PUT /api/teams/[teamId] - 팀 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

    // 데모 모드: 로컬 DB 사용
    if (SKIP_AUTH) {
      const team = localDb.teams.get(teamId)
      if (!team) {
        return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
      }

      const updated = {
        ...team,
        ...validatedData,
        updated_at: new Date().toISOString(),
      }
      localDb.teams.set(teamId, updated)
      return NextResponse.json(updated)
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
    }

    const { data: member } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .eq('role', 'leader')
      .single()

    if (!member && team.created_by !== session.user.id) {
      return NextResponse.json({ error: '팀 리더만 수정할 수 있습니다' }, { status: 403 })
    }

    const { data: updatedTeam, error } = await supabase
      .schema('public')
      .from('teams')
      .update({ ...validatedData, updated_at: new Date().toISOString() })
      .eq('id', teamId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedTeam)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/teams/[teamId] - 팀 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    // 데모 모드: 로컬 DB 사용
    if (SKIP_AUTH) {
      const team = localDb.teams.get(teamId)
      if (!team) {
        return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
      }

      // 관련 데이터 삭제
      localDb.teams.delete(teamId)
      Array.from(localDb.teamMembers.entries())
        .filter(([, m]) => m.team_id === teamId)
        .forEach(([id]) => localDb.teamMembers.delete(id))
      Array.from(localDb.learningLogs.entries())
        .filter(([, l]) => l.team_id === teamId)
        .forEach(([id]) => localDb.learningLogs.delete(id))

      return NextResponse.json({ success: true })
    }

    // 일반 모드: Supabase 사용
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 })
    }

    if (team.created_by !== session.user.id) {
      return NextResponse.json({ error: '팀 생성자만 삭제할 수 있습니다' }, { status: 403 })
    }

    const { error } = await supabase
      .schema('public')
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
