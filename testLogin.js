import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'supplier@gmail.com',
    password: 'derrick1'
  });
  
  if (error) {
    console.error('Login error:', error.message);
    return;
  }
  
  console.log('User ID:', data.user.id);
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, phone, department, branch, employee_number, status, last_login, company_name, address, city, postal_code')
    .eq('id', data.user.id)
    .single();
    
  if (profileError) {
    console.error('Fetch profile error:', profileError);
  } else {
    console.log('Profile data:', profileData);
  }
}

testLogin();
