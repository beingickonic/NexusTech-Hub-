import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const supabase = createClient(url, anonKey);

async function main() {
  console.log("Logging in as inventory@gmail.com...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'inventory@gmail.com',
    password: 'derrick1'
  });

  if (authErr) {
    console.error("Login failed:", authErr.message);
    return;
  }

  supabase.auth.setSession({ access_token: authData.session.access_token, refresh_token: authData.session.refresh_token });
  console.log("Logged in. Fetching inventory item...");

  const { data: inv, error: invErr } = await supabase.from('inventory').select('id').limit(1).single();
  if (invErr || !inv) {
    console.error("No inventory record found or error:", invErr?.message);
    return;
  }
  
  console.log("Testing insert without quantity_before/after...");
  const { data, error } = await supabase.from('inventory_movements').insert([{
    inventory_id: inv.id,
    movement_type: 'ADJUSTMENT',
    quantity: 1,
    reason: 'Test insert column mapping'
  }]).select();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded! Returned columns:", Object.keys(data[0] || {}));
    // Clean up
    await supabase.from('inventory_movements').delete().eq('id', data[0].id);
  }
}

main().catch(console.error);
