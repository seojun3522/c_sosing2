import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://esqmixsaopqjomklvzou.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__y-p6YGNi4JvxB2wdjGG6A_wdYNXks1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

