import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Assuming service role key is placed in .env for migration purposes
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImages() {
  const uploadsDir = path.join(process.cwd(), 'backend', 'uploads', 'products');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log("No images found to migrate in", uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`Uploading ${file}...`);
    const { data, error } = await supabase.storage
      .from('products')
      .upload(`images/${file}`, fileBuffer, {
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
    }
  }
}

uploadImages();
