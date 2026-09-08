import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('your-project')) {
    supabaseUrl = 'https://placeholder.supabase.co';
  }
  if (!serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
    serviceRoleKey = 'placeholder-service-role-key';
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
