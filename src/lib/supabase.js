import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkftwzkqjmormacnucoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZnR3emtxam1vcm1hY251Y295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzk5NDksImV4cCI6MjEwMDg1NTk0OX0.I6lGiKOcU1YOp95RYuw0vucBumhctMbKcwPE2blrVhk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
