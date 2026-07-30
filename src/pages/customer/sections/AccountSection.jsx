import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Calendar, Edit3, Check, X, Camera, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import toast from 'react-hot-toast';
import UserAvatar from '../../../components/common/UserAvatar';

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
    {subtitle && <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

const InfoField = ({ icon: Icon, label, value, editable, name, onChange, type = 'text', disabled = false }) => (
  <div className="flex items-start gap-4 p-4 bg-white dark:bg-nexus-bg rounded-xl border border-slate-200 dark:border-[#1F2937] group">
    <div className="p-2.5 rounded-lg bg-nexus-primary/10 text-nexus-primary flex-shrink-0 mt-0.5">
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-nexus-textSecondary dark:text-gray-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
      {editable ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-medium outline-none border-b border-slate-200 dark:border-[#1F2937] focus:border-nexus-primary pb-1 transition-colors placeholder-gray-600 disabled:opacity-50"
        />
      ) : (
        <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{value || <span className="text-nexus-textSecondary dark:text-gray-600">Not set</span>}</p>
      )}
    </div>
  </div>
);

const AccountSection = () => {
  const { user, login, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [memberSince, setMemberSince] = useState('');
  
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      full_name: user.full_name || '',
      phone: user.phone || '',
      email: user.email || '',
    });
    setMemberSince(
      user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A'
    );
    // Fetch full profile from DB for phone
    supabase
      .from('profiles')
      .select('phone, created_at')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(prev => ({ ...prev, phone: data.phone || '' }));
          if (data.created_at) {
            setMemberSince(new Date(data.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }));
          }
        }
      });
  }, [user]);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name, phone: profile.phone })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setPwForm({ current: '', next: '', confirm: '' });
      setChangingPw(false);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update global context so all components sync immediately
      updateUser({ avatar_url: publicUrl });
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="My Account" subtitle="Manage your personal information and security" />

      {/* Avatar card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <UserAvatar src={user?.avatar_url} name={user?.full_name || user?.email} size="xl" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <button
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-nexus-primary text-white hover:bg-[#ff5a2e] transition-colors shadow-lg"
              title="Upload avatar"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.full_name || 'Customer'}</h2>
            <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-nexus-primary/10 border border-nexus-primary/20 rounded-full text-xs font-medium text-nexus-primary">
              <Shield size={11} /> {user?.role || 'Customer'}
            </span>
          </div>
          <div className="ml-auto hidden sm:block">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#1F2937] text-nexus-textSecondary dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>
        {/* Mobile edit button */}
        <div className="mt-4 sm:hidden">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#1F2937] text-nexus-textSecondary dark:text-gray-400 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-nexus-primary text-slate-900 dark:text-white text-sm font-medium disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-gray-300 text-sm">Edit Profile</button>
          )}
        </div>
      </div>

      {/* Profile Fields */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6 mb-6">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2"><User size={16} className="text-nexus-primary" /> Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoField icon={User}     label="Full Name"    name="full_name" value={profile.full_name} editable={editing} onChange={handleChange} />
          <InfoField icon={Mail}     label="Email Address" name="email"    value={profile.email}     editable={false} onChange={handleChange} disabled />
          <InfoField icon={Phone}    label="Phone Number" name="phone"     value={profile.phone}     editable={editing} onChange={handleChange} type="tel" />
          <InfoField icon={Calendar} label="Member Since" name="since"     value={memberSince}       editable={false} />
          <InfoField icon={Shield}   label="Account Role" name="role"      value={user?.role}        editable={false} />
        </div>
      </div>

      {/* Password section */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2"><Lock size={16} className="text-nexus-primary" /> Password & Security</h3>
          <button
            onClick={() => setChangingPw(!changingPw)}
            className="text-sm text-nexus-primary hover:text-[#ff5a2e] transition-colors font-medium"
          >
            {changingPw ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {changingPw ? (
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {[
              { name: 'next',    label: 'New Password',     placeholder: 'Min. 8 characters' },
              { name: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
            ].map(field => (
              <div key={field.name}>
                <label className="text-xs text-nexus-textSecondary dark:text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">{field.label}</label>
                <input
                  type="password"
                  value={pwForm[field.name]}
                  onChange={e => setPwForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors placeholder-gray-600"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Update Password
            </button>
          </form>
        ) : (
          <p className="text-nexus-textSecondary dark:text-gray-500 text-sm">Last changed: Never. Keep your account secure by using a strong, unique password.</p>
        )}
      </div>
    </motion.div>
  );
};

export default AccountSection;
