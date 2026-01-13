import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';

export default async function TeamLogsPage({
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">학습 로그</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">학습 로그 페이지입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

