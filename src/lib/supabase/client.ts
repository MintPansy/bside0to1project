import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
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

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

