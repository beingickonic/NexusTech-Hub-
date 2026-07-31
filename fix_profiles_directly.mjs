import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const usersToFix = [
  { email: 'financem@gmail.com', role: 'Finance_Officer', dept: 'Finance' },
  { email: 'inventory@gmail.com', role: 'Warehouse_Staff', dept: 'Inventory' },
  { email: 'dispatch@gmail.com', role: 'Dispatch_Officer', dept: 'Dispatch' },
  { email: 'driver@gmail.com', role: 'Driver', dept: 'Driver' }
];

async function main() {
  console.log("Starting direct profile self-updates...");

  for (const userConfig of usersToFix) {
    const client = createClient(url, anonKey);
    console.log(`\nLogging in as ${userConfig.email}...`);
    
    const { data: authData, error: authErr } = await client.auth.signInWithPassword({
      email: userConfig.email,
      password: 'derrick1'
    });

    if (authErr) {
      console.error(`  Login failed for ${userConfig.email}:`, authErr.message);
      continue;
    }

    client.auth.setSession({ access_token: authData.session.access_token, refresh_token: authData.session.refresh_token });
    console.log(`  Logged in. User ID: ${authData.user.id}. Updating own profile...`);

    const { error: updateErr } = await client
      .from('profiles')
      .update({ role: userConfig.role, department: userConfig.dept })
      .eq('id', authData.user.id);

    if (updateErr) {
      console.error(`  ✗ Update failed:`, updateErr.message);
    } else {
      console.log(`  ✓ Update request sent successfully.`);
    }

    // Verify
    const { data: verifyProf } = await client.from('profiles').select('role, department').eq('id', authData.user.id).single();
    console.log(`  Verification - Role: ${verifyProf?.role}, Dept: ${verifyProf?.department}`);
  }
}

main().catch(console.error);
