import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Mail, Phone, Shield, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import toast from 'react-hot-toast';

const ToggleSwitch = ({ checked, onChange, label, description, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-nexus-bg rounded-xl border border-nexus-border dark:border-nexus-card">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-nexus-primary/10">
        <Icon size={16} className="text-nexus-primary" />
      </div>
      <div>
        <p className="text-nexus-heading text-sm font-medium">{label}</p>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs mt-0.5">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-nexus-primary' : 'bg-nexus-dark-navy'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

const SettingsSection = () => {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [emailOpt, setEmailOpt] = useState(true);
  const [smsOpt, setSmsOpt] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { toast.error('Min 8 characters required'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); setPwForm({ next: '', confirm: '' }); }
    setPwLoading(false);
  };

  const savePreferences = async () => {
    setPrefLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ email_opt_in: emailOpt, sms_opt_in: smsOpt })
      .eq('id', user.id);
    if (error) toast.error('Failed to save preferences');
    else toast.success('Preferences saved!');
    setPrefLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nexus-heading">Settings</h1>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm mt-1">Manage your account security and preferences</p>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-6 mb-6">
        <h3 className="text-nexus-heading font-semibold mb-5 flex items-center gap-2">
          <Lock size={16} className="text-nexus-primary" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-nexus-textSecondary dark:text-nexus-muted uppercase tracking-wider font-semibold block mb-1.5">New Password</label>
              <input
                type="password" value={pwForm.next} required
                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                placeholder="Min. 8 characters"
                className="w-full bg-white dark:bg-nexus-bg border border-nexus-border dark:border-nexus-card text-nexus-heading rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors placeholder-nexus-muted"
              />
            </div>
            <div>
              <label className="text-xs text-nexus-textSecondary dark:text-nexus-muted uppercase tracking-wider font-semibold block mb-1.5">Confirm Password</label>
              <input
                type="password" value={pwForm.confirm} required
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full bg-white dark:bg-nexus-bg border border-nexus-border dark:border-nexus-card text-nexus-heading rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors placeholder-nexus-muted"
              />
            </div>
          </div>
          {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
            <p className="flex items-center gap-1.5 text-nexus-error text-xs"><AlertTriangle size={12} /> Passwords do not match</p>
          )}
          <button
            type="submit" disabled={pwLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nexus-primary hover:bg-nexus-primary-hover text-nexus-heading text-sm font-medium transition-colors disabled:opacity-60"
          >
            {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Update Password
          </button>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-6 mb-6">
        <h3 className="text-nexus-heading font-semibold mb-5 flex items-center gap-2">
          <Bell size={16} className="text-nexus-primary" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          <ToggleSwitch
            checked={emailOpt}
            onChange={setEmailOpt}
            icon={Mail}
            label="Email Notifications"
            description="Order updates, promotions, and newsletters"
          />
          <ToggleSwitch
            checked={smsOpt}
            onChange={setSmsOpt}
            icon={Phone}
            label="SMS Notifications"
            description="Order status updates via text message"
          />
        </div>
        <button
          onClick={savePreferences} disabled={prefLoading}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-nexus-border dark:border-nexus-card text-nexus-muted hover:text-nexus-heading hover:bg-nexus-surface dark:hover:bg-nexus-hover text-sm font-medium transition-colors disabled:opacity-60"
        >
          {prefLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save Preferences
        </button>
      </div>

      {/* Security info */}
      <div className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-6">
        <h3 className="text-nexus-heading font-semibold mb-4 flex items-center gap-2">
          <Shield size={16} className="text-nexus-primary" /> Account Security
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Two-Factor Authentication', status: 'Not enabled', action: 'Enable', color: 'text-nexus-gold' },
            { label: 'Login Activity',             status: 'Last login just now', action: 'View', color: 'text-nexus-success' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-white dark:bg-nexus-bg rounded-xl border border-nexus-border dark:border-nexus-card">
              <div>
                <p className="text-nexus-heading text-sm font-medium">{item.label}</p>
                <p className={`text-xs mt-0.5 ${item.color}`}>{item.status}</p>
              </div>
              <button
                onClick={() => toast('Coming soon!', { icon: '🔐' })}
                className="text-xs text-nexus-textSecondary dark:text-nexus-muted hover:text-nexus-heading border border-nexus-border dark:border-nexus-card px-3 py-1.5 rounded-lg transition-colors"
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsSection;
