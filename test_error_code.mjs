import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const supabase = createClient(url, anonKey);

async function main() {
  const { data, error } = await supabase.from('inventory_movements').select('*').limit(1);
  if (error) {
    console.error("Error fetching inventory_movements:", error);
  } else {
    console.log("Columns of inventory_movements:", Object.keys(data[0] || { message: "No rows found" }));
  }
}

main().catch(console.error);
