import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('your-project')) {
    supabaseUrl = 'https://placeholder.supabase.co';
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    supabaseAnonKey = 'placeholder-anon-key';
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
