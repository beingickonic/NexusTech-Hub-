import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env");
  console.error("Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file to run this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SEED_ACCOUNTS = [
  { email: 'dispatch@gmail.com',  password: 'derrick1', role: 'dispatch',  department: 'Dispatch' },
  { email: 'driver@gmail.com',    password: 'derrick1', role: 'driver',    department: 'Driver' },
  { email: 'inventory@gmail.com', password: 'derrick1', role: 'inventory', department: 'Inventory' },
  { email: 'supplier@gmail.com',  password: 'derrick1', role: 'supplier',  department: 'Supplier' },
];

async function seed() {
  console.log("🚀 Starting Department Account Seed...\n");

  for (const acc of SEED_ACCOUNTS) {
    try {
      console.log(`Processing ${acc.email}...`);
      
      // 1. Check if user already exists
      const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
      if (searchError) throw searchError;
      
      let userId = null;
      const existing = existingUsers.users.find(u => u.email === acc.email);

      if (existing) {
        console.log(`  - Found existing user in auth.users (${existing.id})`);
        userId = existing.id;
      } else {
        // 2. Create the user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { full_name: `${acc.department} User` }
        });
        if (createError) throw createError;
        
        console.log(`  - Created new user in auth.users (${newUser.user.id})`);
        userId = newUser.user.id;
      }

      // 3. Upsert profiles row with correct role & department
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: acc.role,
          department: acc.department,
          status: 'Active',
          full_name: `${acc.department} User`,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
      console.log(`  - ✅ Successfully mapped profiles row -> Role: ${acc.role}`);
      
    } catch (err) {
      console.error(`  - ❌ Error processing ${acc.email}:`, err.message);
    }
    console.log("-----------------------------------------");
  }

  console.log("🎉 Seed complete! You can now log into the portals.");
}

seed();
