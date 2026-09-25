const supabase = require('../config/supabaseClient');

async function testConnection() {
  console.log('📡 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('halls').select('*').limit(5);
    if (error) {
      console.log('ℹ️ Supabase Response:', error.message);
      console.log('Note: If table doesn\'t exist yet, run the SQL schema in Supabase SQL Editor!');
    } else {
      console.log('✅ Connected to Supabase successfully! Halls found:', data.length);
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
  }
}

testConnection();
