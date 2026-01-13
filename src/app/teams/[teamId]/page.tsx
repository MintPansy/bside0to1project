import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase';

export default async function TeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 팀 정보 조회
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.teamId)
    .single();

  if (teamError || !team) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">팀을 찾을 수 없습니다</h1>
        </div>
      </div>
    );
  }

  // 팀원 목록 조회
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('team_id', params.teamId);

  // 학습 로그 통계 (지난 7일)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: logCount } = await supabase
    .from('learning_logs')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', params.teamId)
    .gte('created_at', sevenDaysAgo.toISOString());

  const stats = {
    memberCount: members?.length || 0,
    logCountLast7Days: logCount || 0,
  };

  // 사용자가 팀 리더인지 확인
  const currentMember = members?.find((m: any) => m.user_id === session.user.id);
  const isLeader = currentMember?.role === 'leader' || team.created_by === session.user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
              {team.description && (
                <p className="text-gray-600">{team.description}</p>
              )}
            </div>
            {isLeader && (
              <Link
                href={`/teams/${params.teamId}/settings`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                설정
              </Link>
            )}
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">팀원 수</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.memberCount}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">지난 7일 로그</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.logCountLast7Days}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">최근 업데이트</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(team.updated_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 팀원 목록 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">팀원</h2>
            <div className="space-y-2">
              {members && members.length > 0 ? (
                members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.users?.name || '알 수 없음'}
                      </p>
                      <p className="text-sm text-gray-500">{member.users?.email}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {member.role === 'leader' ? '리더' : '멤버'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">팀원이 없습니다</p>
              )}
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/teams/${params.teamId}/logs`}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">학습 로그</h3>
              <p className="text-gray-600 text-sm">팀의 학습 내용을 기록하세요</p>
            </Link>
            <Link
              href={`/teams/${params.teamId}/portfolio`}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">포트폴리오</h3>
              <p className="text-gray-600 text-sm">자동 생성된 포트폴리오를 확인하세요</p>
            </Link>
            {isLeader && (
              <Link
                href={`/teams/${params.teamId}/settings`}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">설정</h3>
                <p className="text-gray-600 text-sm">팀 정보를 관리하세요</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
