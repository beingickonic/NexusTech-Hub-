import { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, MapPin, Edit3, Save, CheckCircle, Camera, Shield } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

const InventoryProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    department: '',
    branch: '',
    employee_number: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        department: user.department || 'Warehouse / Inventory',
        branch: user.branch || '',
        employee_number: user.employee_number || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          department: form.department,
          branch: form.branch,
          employee_number: form.employee_number,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Warehouse Staff';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const fieldCls = editing
    ? 'px-4 py-3 bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl text-sm text-nexus-heading focus:outline-none focus:ring-2 focus:ring-primary/40 w-full transition-colors'
    : 'px-4 py-3 bg-nexus-surface dark:bg-nexus-hover border border-transparent rounded-xl text-sm text-nexus-heading w-full cursor-default';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nexus-heading">My Profile</h1>
        <p className="text-nexus-textSecondary text-sm mt-1">View and update your warehouse portal profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary via-nexus-primary to-nexus-gold relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-nexus-primary-hover flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-white dark:border-dark-surface overflow-hidden">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  : initials
                }
              </div>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                editing
                  ? 'bg-primary hover:bg-nexus-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading'
              }`}
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editing ? (
                <Save size={15} />
              ) : (
                <Edit3 size={15} />
              )}
              {saving ? 'Saving...' : editing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-nexus-heading">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <Shield size={11} />
                {user?.role?.replace('_', ' ') || 'Warehouse Staff'}
              </span>
              {user?.status && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active' ? 'bg-nexus-success/10 dark:bg-nexus-success/15 text-nexus-success' : 'bg-nexus-surface text-nexus-muted'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user.status}
                </span>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                <User size={10} className="inline mr-1" />Full Name
              </label>
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                readOnly={!editing}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                <Mail size={10} className="inline mr-1" />Email
              </label>
              <div className="px-4 py-3 bg-nexus-surface dark:bg-nexus-hover border border-transparent rounded-xl text-sm text-nexus-textSecondary w-full">
                {user?.email || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                <Phone size={10} className="inline mr-1" />Phone
              </label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                readOnly={!editing}
                placeholder="e.g. +254..."
                className={fieldCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                <Building2 size={10} className="inline mr-1" />Department
              </label>
              <input
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                readOnly={!editing}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                <MapPin size={10} className="inline mr-1" />Branch / Location
              </label>
              <input
                value={form.branch}
                onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                readOnly={!editing}
                placeholder="e.g. Nairobi Warehouse"
                className={fieldCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
                Employee Number
              </label>
              <input
                value={form.employee_number}
                onChange={e => setForm(f => ({ ...f, employee_number: e.target.value }))}
                readOnly={!editing}
                placeholder="EMP-XXXX"
                className={fieldCls}
              />
            </div>
          </div>

          {editing && (
            <div className="mt-4 flex gap-3 pt-4 border-t border-nexus-border">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-nexus-border text-sm font-medium text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-nexus-primary-hover text-white text-sm font-semibold transition-colors shadow-lg shadow-primary/25 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryProfilePage;
