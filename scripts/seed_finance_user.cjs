require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('CRITICAL: VITE_SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS and update roles.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seedFinanceUser() {
  console.log('Seeding Finance User...');
  
  const email = 'finance@gmail.com';
  const password = 'derrick1';

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching users:', usersError.message);
    return;
  }

  let user = usersData.users.find(u => u.email.toLowerCase() === email);

  if (!user) {
    console.log('Creating auth user...');
    const { data: newAuthData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (createError) {
      console.error('Error creating user:', createError.message);
      return;
    }
    user = newAuthData.user;
    console.log('Auth user created successfully:', user.id);
  } else {
    console.log('Auth user already exists:', user.id);
    await supabase.auth.admin.updateUserById(user.id, { password });
  }

  console.log('Updating profiles table...');
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
        full_name: 'Finance Manager',
    role: 'Finance Manager',
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    console.error('Failed to update profile:', profileError.message);
  } else {
    console.log('Profile successfully updated to Finance Manager!');
  }
}

seedFinanceUser();
