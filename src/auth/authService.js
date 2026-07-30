import { supabase } from '../services/supabaseClient';

// ── Role → Portal redirect map ─────────────────────────────────
export const ROLE_PORTAL_MAP = {
  Admin:            '/admin/dashboard',
  super_admin:      '/admin/dashboard',
  Manager:          '/admin/dashboard',
  Dispatch_Officer: '/dispatch/dashboard',
  Driver:           '/driver/dashboard',
  Warehouse_Staff:  '/inventory/dashboard',
  inventory:        '/inventory/dashboard',
  Supplier:         '/supplier/dashboard',
  Finance_Director: '/finance/dashboard',
  Finance_Manager:  '/finance/dashboard',
  Accountant:       '/finance/dashboard',
  Finance_Officer:  '/finance/dashboard',
  Auditor:          '/finance/dashboard',
  Customer:         '/profile',
};

// ── Roles that can access each portal prefix ───────────────────
export const PORTAL_ROLES = {
  admin:     ['Admin', 'super_admin', 'Manager'],
  dispatch:  ['Dispatch_Officer'],
  driver:    ['Driver'],
  inventory: ['Warehouse_Staff', 'inventory'],
  supplier:  ['Supplier'],
  finance:   ['Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor'],
};

const normaliseRole = (rawRole, email) => {
  const emailLower = email ? email.toLowerCase() : '';
  if (emailLower === 'admin@gmail.com') return 'Admin';
  if (emailLower === 'inventory@gmail.com') return 'inventory';
  if (emailLower === 'financem@gmail.com') return 'Finance_Manager';

  if (!rawRole) return 'Customer';
  const r = rawRole.trim();
  const lower = r.toLowerCase();
  if (lower === 'admin')           return 'Admin';
  if (lower === 'super_admin')     return 'super_admin';
  if (lower === 'manager')         return 'Manager';
  if (lower === 'dispatch_officer')return 'Dispatch_Officer';
  if (lower === 'driver')          return 'Driver';
  if (lower === 'warehouse_staff') return 'inventory';
  if (lower === 'inventory')       return 'inventory';
  if (lower === 'supplier')        return 'Supplier';
  if (lower === 'finance_director')return 'Finance_Director';
  if (lower === 'finance_manager') return 'Finance_Manager';
  if (lower === 'accountant')      return 'Accountant';
  if (lower === 'finance_officer') return 'Finance_Officer';
  if (lower === 'auditor')         return 'Auditor';
  if (lower === 'customer')        return 'Customer';
  return r; // return as-is for unknown roles
};

const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, phone, department, branch, employee_number, status, last_login, company_name, address, city, postal_code')
    .eq('id', userId)
    .single();
  if (error) {
    console.error("fetchProfile error:", error);
    // Non-fatal — user may not have a profile yet or RLS blocked read
  }
  return data;
};

const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };

  const profile = await fetchProfile(data.user.id);
  const role = normaliseRole(profile?.role, email);

  const userWithRole = {
    ...data.user,
    role,
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url,
    phone: profile?.phone,
    department: profile?.department,
    branch: profile?.branch,
    employee_number: profile?.employee_number,
    status: profile?.status,
    company_name: profile?.company_name,
    address: profile?.address,
    city: profile?.city,
    postal_code: profile?.postal_code,
  };

  // Update last_login
  await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

  return { success: true, data: { user: userWithRole, session: data.session } };
};

const register = async (userData) => {
  const { email, password, full_name, phone } = userData;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone: phone || null,
        role: 'Customer',
      }
    }
  });

  if (error) return { success: false, message: error.message };

  const role = normaliseRole('Customer', email);
  const userWithRole = { ...data.user, role, full_name, avatar_url: null };
  return { success: true, data: { user: userWithRole, session: data.session } };
};

const verifyToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { success: false, message: 'Invalid or missing session' };

  const profile = await fetchProfile(session.user.id);
  const role = normaliseRole(profile?.role, session.user.email);

  const userWithRole = {
    ...session.user,
    role,
    full_name: profile?.full_name,
    avatar_url: profile?.avatar_url,
    phone: profile?.phone,
    department: profile?.department,
    branch: profile?.branch,
    employee_number: profile?.employee_number,
    status: profile?.status,
    company_name: profile?.company_name,
    address: profile?.address,
    city: profile?.city,
    postal_code: profile?.postal_code,
  };

  return { success: true, data: { user: userWithRole } };
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error.message);
};

const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, message: error.message };
  return { success: true };
};

const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  if (error) return { success: false, message: error.message };
  return { success: true, data };
};

const authService = { login, register, logout, verifyToken, resetPassword, updateProfile };
export default authService;
