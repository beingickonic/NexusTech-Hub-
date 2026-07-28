import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Must use service role for admin auth

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixRole() {
  console.log("Fetching user from auth...");
  
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }

  const user = users.find(u => u.email === 'inventory@gmail.com');
  if (!user) {
    console.log("inventory@gmail.com not found in auth.users.");
    return;
  }
  
  console.log("Found user ID:", user.id);

  console.log("Checking profiles table...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error("Error fetching profile:", error);
    return;
  }

  console.log("Found profile role:", data.role);

  if (data.role !== 'inventory') {
    console.log("Updating role to inventory...");
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'inventory' })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error("Error updating profile:", updateError);
    } else {
      console.log("Updated successfully:", updateData);
    }
  } else {
    console.log("Role is already correct.");
  }
}

checkAndFixRole();
