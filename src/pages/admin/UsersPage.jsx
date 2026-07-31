import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Search, CheckCircle, XCircle, 
  Trash2, Mail, Edit3, ShieldAlert 
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import UserAvatar from '../../components/common/UserAvatar';

const AdminUsersPage = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'customer',
    department: ''
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsersList(data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call Vercel Serverless Function to securely create user
      const response = await fetch('/api/admin-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      setShowModal(false);
      fetchUsers();
      setFormData({ email: '', password: '', fullName: '', role: 'customer', department: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely delete the user ${name}? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`/api/admin-users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');
      
      toast.success('User deleted successfully');
      setUsersList(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const response = await fetch('/api/admin-users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ id, updates: { status: newStatus } })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success(`User is now ${newStatus}`);
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = usersList.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase())) ||
    (u.role?.toLowerCase().includes(search.toLowerCase())) ||
    (u.department?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading flex items-center gap-2">
            <ShieldAlert className="text-info" /> User Management
          </h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Securely manage employee access and portal roles.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-info text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-info transition-colors shadow-lg shadow-info/30"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-nexus-card p-4 rounded-2xl border border-nexus-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-nexus-surface border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-info/50 text-nexus-heading"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-nexus-textSecondary" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nexus-surface dark:bg-nexus-hover border-b border-nexus-border">
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase">User</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase">Role / Dept</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase">Joined</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-nexus-textSecondary">Loading users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-nexus-textSecondary">No users found.</td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={u.avatar_url} name={u.full_name} size="sm" />
                      <div>
                        <p className="font-semibold text-nexus-heading text-sm">{u.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-nexus-textSecondary font-mono">{u.id.substring(0,8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-info dark:text-info uppercase tracking-wider text-[11px]">{u.role}</p>
                    <p className="text-xs text-nexus-textSecondary">{u.department || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.status === 'Active' 
                        ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success'
                        : 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'
                    }`}>
                      {u.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-nexus-textSecondary">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(u.id, u.status || 'Active')}
                        className="p-2 rounded-lg bg-nexus-surface text-nexus-muted hover:text-nexus-gold transition-colors"
                        title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        className="p-2 rounded-lg bg-nexus-surface text-nexus-muted hover:text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-nexus-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-nexus-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-nexus-border"
          >
            <div className="p-6 border-b border-nexus-border">
              <h2 className="text-xl font-bold text-nexus-heading">Create Department User</h2>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-semibold text-nexus-muted">Full Name</label>
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-info" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-semibold text-nexus-muted">Email Address (Login)</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-info" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-semibold text-nexus-muted">Password</label>
                  <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-info" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-nexus-muted">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-info">
                    <option value="customer">Customer</option>
                    <option value="dispatch">Dispatch</option>
                    <option value="driver">Driver</option>
                    <option value="inventory">Inventory</option>
                    <option value="supplier">Supplier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-nexus-muted">Department Name</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Operations" className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-info" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-nexus-border">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-nexus-muted bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-info hover:bg-info transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
