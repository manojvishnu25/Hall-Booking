const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gmhjomwwgelysgtzetot.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_g7ey0b-HbtcRxZVRBXLtug_mnPMMh8q';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
