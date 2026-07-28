import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  const { data, error } = await supabase
    .rpc('get_policies', { table_name: 'profiles' }); // We can try to query pg_policies directly
    
  if (error) {
    // If we don't have RPC, let's query pg_policies using postgres syntax via a direct query if possible
    // Supabase JS doesn't support raw SQL easily without RPC, but we can try
    console.log("Cannot easily fetch policies via JS client without RPC.");
  }
}

checkPolicies();
