import { createClient } from '@supabase/supabase-js';

// Read from environment variables, with fallback to default public anon configuration
// Note: In Supabase, the anon key is a public key intended for browser clients protected by RLS
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://xkftwzkqjmormacnucoy.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZnR3emtxam1vcm1hY251Y295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzk5NDksImV4cCI6MjEwMDg1NTk0OX0.I6lGiKOcU1YOp95RYuw0vucBumhctMbKcwPE2blrVhk';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Aimee Collection] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in environment. Falling back to default project client.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates an isolated Supabase client without persisting sessions to localStorage/cookies.
 * Used for administrative actions like creating new user accounts without terminating
 * or overwriting the currently logged-in administrator's session.
 */
export const createIsolatedClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};
