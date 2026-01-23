import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables!\n\n' +
    'Please create a .env.local file in the root directory with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n\n' +
    'You can find these values in your Supabase project settings:\n' +
    'https://supabase.com/dashboard/project/_/settings/api'
  )
}

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 * 
 * 주의: SSR을 사용하는 경우 @/lib/supabase/client의 createClient를 사용하세요.
 * 이 클라이언트는 클라이언트 컴포넌트에서만 사용해야 합니다.
 */
export const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseAnonKey
)

/**
 * 서버 사이드에서 사용하는 Supabase 클라이언트
 * Service Role Key를 사용하여 RLS를 우회할 수 있습니다.
 * 
 * 주의: 이 클라이언트는 서버 사이드에서만 사용해야 합니다.
 * 절대 클라이언트 번들에 포함되지 않도록 주의하세요.
 */
export const supabaseServer = supabaseServiceRoleKey
  ? createSupabaseClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null

if (!supabaseServer) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. ' +
    '서버 사이드 작업에 제한이 있을 수 있습니다.'
  )
}

