import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'financem@gmail.com';
  const password = 'derrick1';
  let userId = null;

  // 1. Try to find user
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }

  const existingUser = usersData.users.find(u => u.email === email);

  if (existingUser) {
    console.log("User already exists. Updating role in profile...");
    userId = existingUser.id;
  } else {
    console.log("Creating new user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    if (createError) {
      console.error("Error creating user:", createError);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log("Created user with ID:", userId);
  }

  // 2. Update/Insert Profile
  const profileData = {
    id: userId,
    role: 'Finance_Manager',
    full_name: 'Finance Manager',
    status: 'Active',
    department: 'Finance'
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    process.exit(1);
  }

  console.log("Profile successfully updated/created.");
  
  // 3. Test Login Verification (using anon key for login)
  const supabaseAnon = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  console.log("Testing Login Verification...");
  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password
  });
  
  if (loginError) {
    console.error("Login verification failed:", loginError.message);
  } else {
    console.log("Login verified successfully!");
  }
}

run();
