import { redirect } from 'next/navigation';
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

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.teamId)
    .single();

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">팀을 찾을 수 없습니다</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{team.name}</h1>
          {team.description && (
            <p className="text-gray-600 mb-6">{team.description}</p>
          )}
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">팀 개요 페이지입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

