import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            대시보드
          </h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">
              환영합니다, {user?.name || session.user.email}님!
            </p>
            <p className="text-gray-500 mt-2">
              LearnTeam에 오신 것을 환영합니다. 팀을 만들고 학습 로그를 시작해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

