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
  // The database (profiles.role) is the source of truth for the user's role.
  if (rawRole) {
    const mapped = mapRole(rawRole.trim());
    if (mapped) return mapped;
    return rawRole.trim(); // return as-is for unknown roles
  }

  // Legacy fallback only when no DB role is available (e.g. profile not created yet).
  const emailLower = email ? email.toLowerCase() : '';
  if (emailLower === 'admin@gmail.com')     return 'Admin';
  if (emailLower === 'inventory@gmail.com') return 'inventory';
  if (emailLower === 'financem@gmail.com')  return 'Finance_Manager';
  return 'Customer';
};

// Normalise any DB spelling/format to the canonical role used across the app.
const mapRole = (r) => {
  const lower = r.toLowerCase();
  if (lower === 'admin')             return 'Admin';
  if (lower === 'super_admin')       return 'super_admin';
  if (lower === 'manager')           return 'Manager';
  if (lower === 'dispatch_officer')  return 'Dispatch_Officer';
  if (lower === 'driver')            return 'Driver';
  if (lower === 'warehouse_staff')   return 'inventory';
  if (lower === 'warehouse')         return 'inventory';
  if (lower === 'inventory')         return 'inventory';
  if (lower === 'supplier')          return 'Supplier';
  if (lower === 'finance_director')  return 'Finance_Director';
  if (lower === 'finance_manager')   return 'Finance_Manager';
  if (lower === 'finance')           return 'Finance_Manager';
  if (lower === 'accountant')        return 'Accountant';
  if (lower === 'finance_officer')   return 'Finance_Officer';
  if (lower === 'auditor')           return 'Auditor';
  if (lower === 'customer')          return 'Customer';
  return null;
};

const fetchProfile = async (userId, email = '') => {
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error:", error);
  }

  // If a profile row does not exist, automatically create a default profile
  if (!data) {
    console.log("No profile found, creating default profile for:", email);
    const defaultProfile = {
      id: userId,
      role: 'Customer',
      full_name: email?.split('@')[0] || 'New User',
      status: 'Active'
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .upsert([defaultProfile]);

    if (insertError) {
      console.error("Error creating default profile:", insertError);
    } else {
      data = defaultProfile;
    }
  }

  return data;
};

const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };

  const profile = await fetchProfile(data.user.id, email);
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

  // Update last_login only if the column exists in the live schema
  if ('last_login' in profile) {
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
  }

  // Record the login in the audit trail so admins can see who has logged in (best-effort)
  supabase
    .rpc('log_audit_event', {
      p_action: 'login',
      p_entity_type: 'user',
      p_entity_id: data.user.id,
      p_metadata: { email },
    })
    .then(() => {})
    .catch(() => {});

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
