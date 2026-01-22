import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables!\n\n' +
    'Please create a .env.local file in the root directory with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'You can find these values in your Supabase project settings:\n' +
    'https://supabase.com/dashboard/project/_/settings/api'
  )
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(
    supabaseUrl!,      // 이제 string 확정
    supabaseAnonKey!   // 이제 string 확정
  )
}

