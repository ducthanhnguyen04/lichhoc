import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('your-project')) {
    supabaseUrl = 'https://placeholder.supabase.co';
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    supabaseAnonKey = 'placeholder-anon-key';
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Ignored when called from Server Component
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Ignored when called from Server Component
        }
      },
    },
  });
}
