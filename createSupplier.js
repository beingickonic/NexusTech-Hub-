import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSupplierUser() {
  const email = 'supplier@gmail.com';
  const password = 'derrick1';
  
  console.log(`Creating/Verifying Auth User for ${email}...`);
  
  try {
    // Attempt to create the user
    let { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    
    let user;

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log(`User ${email} already exists. Fetching user...`);
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        
        user = listData.users.find(u => u.email === email);
        if (!user) throw new Error('Could not find existing user details.');
        
        // Also update the password just to be sure
        await supabaseAdmin.auth.admin.updateUserById(user.id, { password: password });
      } else {
        throw authError;
      }
    } else {
      console.log('Successfully created auth user!');
      user = authData.user;
    }
    
    console.log(`User ID: ${user.id}`);
    console.log('Updating profile with Supplier role...');
    
    // Upsert the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: 'Nexus Supplier Partner',
        role: 'Supplier',
        department: 'Suppliers',
        status: 'Active',
        updated_at: new Date().toISOString()
      });
      
    if (profileError) throw profileError;
    
    console.log('✅ Success! Supplier Profile has been updated/created.');
    console.log('--------------------------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: Supplier`);
    console.log('--------------------------------------------------');
    console.log('You can now log in at /supplier/login');
    
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

createSupplierUser();
