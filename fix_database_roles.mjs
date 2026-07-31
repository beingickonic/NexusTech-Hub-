import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const supabase = createClient(url, anonKey);

async function main() {
  console.log("Logging in as Admin to fix roles...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'derrick1'
  });

  if (authErr) {
    console.error("Admin login failed:", authErr.message);
    return;
  }

  console.log("Logged in successfully. User ID:", authData.user.id);
  supabase.auth.setSession({ access_token: authData.session.access_token, refresh_token: authData.session.refresh_token });

  // List all profiles to see what users we have
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  if (profErr) {
    console.error("Error listing profiles:", profErr.message);
    return;
  }

  console.log(`Found ${profiles.length} profiles:`);
  for (const p of profiles) {
    console.log(`  - ID: ${p.id}, FullName: ${p.full_name}, Email: ${p.email || 'N/A'}, Role: ${p.role}, Dept: ${p.department}`);
  }

  const updates = [
    { email: 'financem@gmail.com', namePattern: 'finance', targetRole: 'Finance_Officer', targetDept: 'Finance' },
    { email: 'inventory@gmail.com', namePattern: 'inventory', targetRole: 'Warehouse_Staff', targetDept: 'Inventory' },
    { email: 'dispatch@gmail.com', namePattern: 'dispatch', targetRole: 'Dispatch_Officer', targetDept: 'Dispatch' },
    { email: 'driver@gmail.com', namePattern: 'driver', targetRole: 'Driver', targetDept: 'Driver' }
  ];

  for (const update of updates) {
    const prof = profiles.find(p => 
      (p.email && p.email.toLowerCase() === update.email) ||
      (p.full_name && p.full_name.toLowerCase().includes(update.namePattern))
    );
    if (prof) {
      console.log(`Updating ${prof.email || prof.full_name} (${prof.id}) to role '${update.targetRole}' and dept '${update.targetDept}'...`);
      const { error } = await supabase
        .from('profiles')
        .update({ role: update.targetRole, department: update.targetDept })
        .eq('id', prof.id);
      if (error) {
        console.error(`  Error updating profile:`, error.message);
      } else {
        console.log(`  Successfully sent update command.`);
      }
    } else {
      console.log(`No profile found matching pattern for ${update.email}`);
    }
  }
}

main().catch(console.error);
