import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key for Admin privileges
// NOTE: Vercel auto-injects process.env variables from your Vercel project settings
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Authenticate Request
  // Ensure the request comes from an authenticated Admin user
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Double check that the calling user actually has the admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // 2. Handle CRUD operations
  try {
    if (req.method === 'POST') {
      const { email, password, role, department, fullName } = req.body;

      // A) Create user in auth.users
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: { full_name: fullName }
      });

      if (createError) throw createError;

      // B) Update profiles table securely (auth trigger usually creates a blank row, so we UPDATE it, or UPSERT)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          role: role,
          department: department,
          status: 'Active',
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      return res.status(200).json({ success: true, user: authData.user });
    }

    if (req.method === 'PATCH') {
      const { id, updates } = req.body;
      
      // Separate auth updates (password) from profile updates
      if (updates.password) {
         const { error } = await supabase.auth.admin.updateUserById(id, { password: updates.password });
         if (error) throw error;
      }

      // Update profiles
      const profileUpdates = { ...updates };
      delete profileUpdates.password;
      
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', id);
        if (error) throw error;
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(400).json({ error: error.message });
  }
}
