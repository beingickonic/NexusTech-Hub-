import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthFlow() {
  console.log("Checking auth flow for inventory@gmail.com...");
  
  // Create an anon client to simulate frontend
  const anonSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  
  // Sign in
  const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
    email: 'inventory@gmail.com',
    password: 'password123' // assuming default password, let's just see if we can query as anon without signing in first, wait, no, anon can't read profiles maybe?
  });
  
  if (authError) {
    console.log("Cannot sign in to test:", authError.message);
    return;
  }
  
  console.log("Signed in successfully. Fetching profile...");
  
  const { data, error } = await anonSupabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();
    
  if (error) {
    console.error("fetchProfile ERROR:", error);
  } else {
    console.log("fetchProfile DATA:", data);
  }
}

checkAuthFlow();
