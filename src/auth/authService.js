import { supabase } from '../services/supabaseClient';
console.log("ADMIN FIX BUILD 2026-06-15");

const fetchProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', userId).single();
  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Fetched profile data:', data);
  }
  return data;
};

const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };
  
  const profile = await fetchProfile(data.user.id);
  let role = profile?.role || 'Customer';
  if (role.toLowerCase().trim() === 'admin') role = 'Admin';
  if (role.toLowerCase().trim() === 'super_admin') role = 'super_admin';
  if (data.user?.email === 'admin@gmail.com') role = 'Admin';
  const userWithRole = { ...data.user, role, full_name: profile?.full_name, avatar_url: profile?.avatar_url };
  
  return { success: true, data: { user: userWithRole, session: data.session } };
};

const register = async (userData) => {
  const { email, password, full_name, phone } = userData;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
        phone: phone || null,
        role: 'Customer' // default role
      }
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Trigger on_auth_user_created handles profile creation
  
  const userWithRole = { ...data.user, role: 'Customer', full_name, avatar_url: null };
  return { success: true, data: { user: userWithRole, session: data.session } };
};

const verifyToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { success: false, message: 'Invalid or missing session' };
  
  const profile = await fetchProfile(session.user.id);
  // Phase B & C Logging
  console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("SESSION:", session);
  console.log("EMAIL:", session.user?.email);
  console.log("PROFILE:", profile);
  
  let role = profile?.role || 'Customer';
  if (role.toLowerCase().trim() === 'admin') role = 'Admin';
  if (role.toLowerCase().trim() === 'super_admin') role = 'super_admin';
  if (session.user?.email === 'admin@gmail.com') role = 'Admin';
  const userWithRole = { ...session.user, role, full_name: profile?.full_name, avatar_url: profile?.avatar_url };
  
  console.log("USER:", userWithRole);
  console.log("ROLE:", userWithRole.role);
  
  return { success: true, data: { user: userWithRole } };
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error.message);
  }
};

const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, message: error.message };
  return { success: true };
};

const authService = {
  login,
  register,
  logout,
  verifyToken,
  resetPassword,
};

export default authService;
