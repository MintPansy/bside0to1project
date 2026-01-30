import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SKIP_AUTH, DEMO_USER } from '@/lib/auth/demo'
import { getTeamsByUserId, getLearningLogsByTeamId, getPortfoliosByTeamId, getTeamMembers, localDb } from '@/lib/store/local-db'
import CreateTeamModal from '@/components/CreateTeamModal'
import DashboardStats from '@/components/DashboardStats'
import TeamCard from '@/components/TeamCard'
import ActivityFeed from '@/components/ActivityFeed'
import IconWrapper from '@/components/IconWrapper'
import PersonalLearningLogSection from '@/components/PersonalLearningLogSection'
import LogoutButton from '@/components/LogoutButton'
import DashboardPortfolioCard from '@/components/DashboardPortfolioCard'
import type { PortfolioStats } from '@/types/portfolio'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // SKIP_AUTH 모드: 로컬 데이터 사용
  if (SKIP_AUTH) {
    const userId = DEMO_USER.id
    const userName = DEMO_USER.name
    const userEmail = DEMO_USER.email

    // 로컬 DB에서 데이터 조회
    const teams = getTeamsByUserId(userId)
    const totalTeams = teams.length

    let totalLogs = 0
    let totalPortfolios = 0
    const activities: any[] = []

    const teamsWithStats = teams.map(team => {
      const members = getTeamMembers(team.id)
      const logs = getLearningLogsByTeamId(team.id)
      const portfolios = getPortfoliosByTeamId(team.id)

      totalLogs += logs.length
      totalPortfolios += portfolios.length

      // 활동 추가
      logs.forEach(log => {
        activities.push({
          type: 'log',
          id: log.id,
          title: log.title,
          user: log.user?.name || '알 수 없음',
          team: team.name,
          teamId: team.id,
          createdAt: log.created_at,
        })
      })

      portfolios.forEach(portfolio => {
        activities.push({
          type: 'portfolio',
          id: portfolio.id,
          title: portfolio.title,
          team: team.name,
          teamId: team.id,
          createdAt: portfolio.created_at,
        })
      })

      activities.push({
        type: 'team',
        id: team.id,
        title: team.name,
        createdAt: team.created_at,
      })

      const lastLog = logs[0]

      return {
        ...team,
        memberCount: members.length,
        logCount: logs.length,
        lastUpdated: lastLog?.created_at || team.updated_at,
      }
    })

    // 시간순 정렬
    activities.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* 데모 모드 배너 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>데모 모드</strong> - Supabase 없이 로컬 데이터로 테스트 중입니다. 서버 재시작 시 데이터가 초기화됩니다.
              </p>
            </div>

            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">대시보드</h1>
                <p className="text-gray-600">
                  환영합니다, <span className="font-semibold text-blue-600">{userName}</span>님!
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <CreateTeamModal />
                <LogoutButton />
              </div>
            </div>

            {/* 개인 학습 로그 섹션 */}
            <div className="mb-10">
              <PersonalLearningLogSection userId={userId} />
            </div>

            {/* 포트폴리오 카드 */}
            <div className="mb-10">
              <DashboardPortfolioCard
                portfolio={null}
                stats={null}
                userName={userName}
              />
            </div>

            {/* 빠른 통계 섹션 */}
            <DashboardStats
              totalTeams={totalTeams}
              totalLogs={totalLogs}
              totalPortfolios={totalPortfolios}
            />

            {/* 내 팀들 섹션 */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">내 팀들</h2>
                  <p className="text-gray-600 text-sm">
                    {totalTeams}개 팀 | {totalLogs}개 로그
                  </p>
                </div>
              </div>

              {teamsWithStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamsWithStats.map((team: any, index: number) => (
                    <TeamCard key={team.id} team={team} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconWrapper icon="Users" className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">아직 팀이 없습니다</p>
                  <p className="text-gray-500 text-sm mb-6">
                    첫 팀을 만들어서 학습 여정을 시작해보세요!
                  </p>
                  <CreateTeamModal />
                </div>
              )}
            </div>

            {/* 최근 활동 섹션 */}
            {activities.length > 0 && (
              <div className="mt-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">최근 활동</h2>
                <ActivityFeed activities={activities.slice(0, 10)} />
              </div>
            )}

            {/* 빠른 액션 카드 */}
            {teamsWithStats.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href={`/teams/${teamsWithStats[0].id}/logs/new`}
                  className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <IconWrapper icon="FileText" className="w-6 h-6" />
                    </div>
                    <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">새 로그 작성</h3>
                  <p className="text-green-100 text-sm">학습 내용을 기록하세요</p>
                </Link>

                <Link
                  href={`/teams/${teamsWithStats[0].id}/portfolio`}
                  className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <IconWrapper icon="FolderKanban" className="w-6 h-6" />
                    </div>
                    <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">포트폴리오 보기</h3>
                  <p className="text-orange-100 text-sm">자동 생성된 포트폴리오 확인</p>
                </Link>

                <Link
                  href="/dashboard"
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <IconWrapper icon="TrendingUp" className="w-6 h-6" />
                    </div>
                    <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">성장 분석</h3>
                  <p className="text-purple-100 text-sm">학습 통계 확인하기</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 일반 모드: Supabase 사용
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
    return null as never
  }

  const userId = session.user.id
  const userEmail = session.user.email || ''

  const { data: user } = await supabase
    .schema('public')
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: teams } = await supabase
    .schema('public')
    .from('teams')
    .select(`*, team_members!inner(user_id)`)
    .or(`created_by.eq.${userId},team_members.user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  let totalTeams = teams?.length || 0
  let totalLogs = 0
  let totalPortfolios = 0

  if (teams && teams.length > 0) {
    const teamIds = teams.map((t: any) => t.id)

    const { count: logsCount } = await supabase
      .schema('public')
      .from('learning_logs')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)

    const { count: portfoliosCount } = await supabase
      .schema('public')
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)

    totalLogs = logsCount || 0
    totalPortfolios = portfoliosCount || 0
  }

  const activities: any[] = []

  if (teams && teams.length > 0) {
    const teamIds = teams.map((t: any) => t.id)

    const { data: recentLogs } = await supabase
      .schema('public')
      .from('learning_logs')
      .select(`*, users:created_by (name, email), teams:team_id (name)`)
      .in('team_id', teamIds)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentPortfolios } = await supabase
      .schema('public')
      .from('portfolios')
      .select(`*, teams:team_id (name)`)
      .in('team_id', teamIds)
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentLogs) {
      recentLogs.forEach((log: any) => {
        activities.push({
          type: 'log',
          id: log.id,
          title: log.title,
          user: log.users?.name || '알 수 없음',
          team: log.teams?.name || '알 수 없음',
          teamId: log.team_id,
          createdAt: log.created_at,
        })
      })
    }

    if (recentPortfolios) {
      recentPortfolios.forEach((portfolio: any) => {
        activities.push({
          type: 'portfolio',
          id: portfolio.id,
          title: portfolio.title,
          team: portfolio.teams?.name || '알 수 없음',
          teamId: portfolio.team_id,
          createdAt: portfolio.created_at,
        })
      })
    }

    teams.forEach((team: any) => {
      activities.push({
        type: 'team',
        id: team.id,
        title: team.name,
        createdAt: team.created_at,
      })
    })

    activities.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const { data: portfolio } = await supabase
    .from('personal_portfolios')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const { data: personalLogs } = await supabase
    .from('personal_learning_logs')
    .select('id, content, log_date, tags')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })

  const personalLogsArray = personalLogs || []
  const personalTotalLogs = personalLogsArray.length
  const uniqueDates = new Set(personalLogsArray.map(log => log.log_date))
  const totalDays = uniqueDates.size
  const averagePerDay = totalDays > 0 ? Number((personalTotalLogs / totalDays).toFixed(2)) : 0

  const portfolioStats: PortfolioStats | null = portfolio
    ? {
      total_logs: personalTotalLogs,
      total_days: totalDays,
      average_per_day: averagePerDay,
      recent_logs: personalLogsArray.slice(0, 10).map(log => ({
        id: log.id,
        content: log.content,
        log_date: log.log_date,
        tags: log.tags || [],
      })),
      top_tags: (() => {
        const tagCounts: Record<string, number> = {}
        personalLogsArray.forEach(log => {
          if (log.tags && Array.isArray(log.tags)) {
            log.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        })
        return Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      })(),
    }
    : null

  const teamsWithStats = await Promise.all(
    (teams || []).map(async (team: any) => {
      const { count: memberCount } = await supabase
        .schema('public')
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)

      const { count: logCount } = await supabase
        .schema('public')
        .from('learning_logs')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)

      const { data: lastLog } = await supabase
        .schema('public')
        .from('learning_logs')
        .select('created_at')
        .eq('team_id', team.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        ...team,
        memberCount: memberCount || 0,
        logCount: logCount || 0,
        lastUpdated: lastLog?.created_at || team.updated_at,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">대시보드</h1>
              <p className="text-gray-600">
                환영합니다, <span className="font-semibold text-blue-600">{user?.name || userEmail}</span>님!
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <CreateTeamModal />
              <LogoutButton />
            </div>
          </div>

          {/* 개인 학습 로그 섹션 */}
          <div className="mb-10">
            <PersonalLearningLogSection userId={userId} />
          </div>

          {/* 포트폴리오 카드 */}
          <div className="mb-10">
            <DashboardPortfolioCard
              portfolio={portfolio}
              stats={portfolioStats}
              userName={user?.name || userEmail.split('@')[0]}
            />
          </div>

          {/* 빠른 통계 섹션 */}
          <DashboardStats
            totalTeams={totalTeams}
            totalLogs={totalLogs}
            totalPortfolios={totalPortfolios}
          />

          {/* 내 팀들 섹션 */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">내 팀들</h2>
                <p className="text-gray-600 text-sm">
                  {totalTeams}개 팀 | {totalLogs}개 로그
                </p>
              </div>
            </div>

            {teamsWithStats && teamsWithStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamsWithStats.map((team: any, index: number) => (
                  <TeamCard key={team.id} team={team} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconWrapper icon="Users" className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">아직 팀이 없습니다</p>
                <p className="text-gray-500 text-sm mb-6">
                  첫 팀을 만들어서 학습 여정을 시작해보세요!
                </p>
                <CreateTeamModal />
              </div>
            )}
          </div>

          {/* 최근 활동 섹션 */}
          {activities.length > 0 && (
            <div className="mt-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">최근 활동</h2>
              <ActivityFeed activities={activities.slice(0, 10)} />
            </div>
          )}

          {/* 빠른 액션 카드 */}
          {teamsWithStats && teamsWithStats.length > 0 && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href={`/teams/${teamsWithStats[0].id}/logs/new`}
                className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <IconWrapper icon="FileText" className="w-6 h-6" />
                  </div>
                  <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2">새 로그 작성</h3>
                <p className="text-green-100 text-sm">학습 내용을 기록하세요</p>
              </Link>

              <Link
                href={`/teams/${teamsWithStats[0].id}/portfolio`}
                className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <IconWrapper icon="FolderKanban" className="w-6 h-6" />
                  </div>
                  <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2">포트폴리오 보기</h3>
                <p className="text-orange-100 text-sm">자동 생성된 포트폴리오 확인</p>
              </Link>

              <Link
                href="/dashboard"
                className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <IconWrapper icon="TrendingUp" className="w-6 h-6" />
                  </div>
                  <IconWrapper icon="ArrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2">성장 분석</h3>
                <p className="text-purple-100 text-sm">학습 통계 확인하기</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
