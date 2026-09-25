import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gmhjomwwgelysgtzetot.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_g7ey0b-HbtcRxZVRBXLtug_mnPMMh8q';

export const supabase = createClient(supabaseUrl, supabaseKey);
