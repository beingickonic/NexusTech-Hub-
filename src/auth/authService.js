import { supabase } from '../services/supabaseClient';

// ── Role → Portal redirect map ─────────────────────────────────
export const ROLE_PORTAL_MAP = {
  Admin:            '/admin/dashboard',
  super_admin:      '/admin/dashboard',
  Manager:          '/admin/dashboard',
  Dispatch_Officer: '/dispatch/dashboard',
  Driver:           '/driver/dashboard',
  Warehouse_Staff:  '/inventory/dashboard',
  Finance_Officer:  '/finance/dashboard',
  Supplier:         '/supplier/dashboard',
  Customer:         '/profile',
};

// ── Roles that can access each portal prefix ───────────────────
export const PORTAL_ROLES = {
  admin:     ['Admin', 'super_admin', 'Manager'],
  dispatch:  ['Dispatch_Officer'],
  driver:    ['Driver'],
  inventory: ['Warehouse_Staff'],
  finance:   ['Finance_Officer'],
  supplier:  ['Supplier'],
};

// Normalise a raw role string from the DB
const normaliseRole = (rawRole, email) => {
  if (!rawRole) return 'Customer';
  const r = rawRole.trim();
  const lower = r.toLowerCase();
  if (lower === 'admin')           return 'Admin';
  if (lower === 'super_admin')     return 'super_admin';
  if (lower === 'manager')         return 'Manager';
  if (lower === 'dispatch_officer')return 'Dispatch_Officer';
  if (lower === 'driver')          return 'Driver';
  if (lower === 'warehouse_staff') return 'Warehouse_Staff';
  if (lower === 'finance_officer') return 'Finance_Officer';
  if (lower === 'supplier')        return 'Supplier';
  if (lower === 'customer')        return 'Customer';
  return r; // return as-is for unknown roles
};

const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, phone, department, branch, employee_number, status, last_login, company_name')
    .eq('id', userId)
    .single();
  if (error) {
    // Non-fatal — user may not have a profile yet
  }
  return data;
};

const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };

  const profile = await fetchProfile(data.user.id);
  let role = normaliseRole(profile?.role, email);
  // Hardcoded admin email override
  if (data.user?.email === 'admin@gmail.com') role = 'Admin';

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

  const userWithRole = { ...data.user, role: 'Customer', full_name, avatar_url: null };
  return { success: true, data: { user: userWithRole, session: data.session } };
};

const verifyToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { success: false, message: 'Invalid or missing session' };

  const profile = await fetchProfile(session.user.id);
  let role = normaliseRole(profile?.role, session.user.email);
  if (session.user?.email === 'admin@gmail.com') role = 'Admin';

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

const authService = { login, register, logout, verifyToken, resetPassword };
export default authService;
