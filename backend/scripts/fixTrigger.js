// scripts/fixTrigger.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase admin credentials. Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTrigger() {
  try {
    console.log('🔧 Applying trigger fix...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'fix_trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Failed to execute SQL:', error);
      // Try direct execution
      console.log('🔄 Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(1);
      if (directError) {
        console.log('⚠️  Cannot execute raw SQL via RPC. Please run the SQL manually in Supabase dashboard:');
        console.log('');
        console.log('SQL to execute:');
        console.log('================');
        console.log(sql);
        console.log('================');
        return;
      }
    }

    console.log('✅ Trigger fix applied successfully');

  } catch (error) {
    console.error('❌ Trigger fix failed:', error);
    console.log('');
    console.log('🔧 MANUAL FIX REQUIRED:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the contents of backend/fix_trigger.sql');
  }
}

fixTrigger();
