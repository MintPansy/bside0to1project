import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase';
import CreateTeamModal from '@/components/CreateTeamModal';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // 현재 사용자가 속한 팀 조회
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      team_members!inner(user_id)
    `)
    .or(`created_by.eq.${session.user.id},team_members.user_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              대시보드
            </h1>
            <CreateTeamModal />
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <p className="text-gray-600">
              환영합니다, <span className="font-semibold">{user?.name || session.user.email}</span>님!
            </p>
            <p className="text-gray-500 mt-2">
              LearnTeam에 오신 것을 환영합니다. 팀을 만들고 학습 로그를 시작해보세요.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">내 팀</h2>
            {teams && teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team: any) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                    <div className="text-sm text-gray-500">
                      생성일: {new Date(team.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">아직 팀이 없습니다.</p>
                <p className="text-gray-500 text-sm">
                  위의 '팀 만들기' 버튼을 클릭하여 첫 팀을 만들어보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
