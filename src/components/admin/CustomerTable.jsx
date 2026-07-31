import { useState, useEffect } from 'react';
import { Search, Filter, Ban, CheckCircle, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import { adminService } from '../../services/adminService';

const getRelativeTime = (dateStr) => {
  if (!dateStr) return 'Never';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = new Date(dateStr) - new Date();
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);

  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour');
  return rtf.format(days, 'day');
};

const STATUS_STYLE = (status) => {
  if (status === 'Active' || status === 'approved') {
    return 'bg-nexus-success/5 text-nexus-success border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20';
  }
  if (status === 'pending') {
    return 'bg-nexus-primary/10 text-nexus-primary border-nexus-primary/20 dark:bg-nexus-primary/10 dark:text-nexus-primary dark:border-nexus-primary/20';
  }
  return 'bg-nexus-error/5 text-nexus-error border-nexus-error/20 dark:bg-nexus-error/10 dark:text-nexus-error dark:border-nexus-error/20';
};

const CustomerTable = () => {
  const [search, setSearch] = useState('');
  const [loginFilter, setLoginFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' });

  const fetchCustomers = async (currentPage = 1, searchQuery = search, login = loginFilter) => {
    try {
      setIsLoading(true);
      const response = await adminService.getCustomers({ page: currentPage, search: searchQuery, loginFilter: login });
      if (response.status === 'success') {
        setCustomers(response.data);
        if (response.meta) setMeta(response.meta);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(1, search, loginFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, loginFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchCustomers(newPage, search, loginFilter);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const isActive = currentStatus === 'Active' || currentStatus === 'approved';
    const newStatus = isActive ? 'Suspended' : 'Active';
    if (window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      try {
        await adminService.updateCustomerStatus(id, newStatus);
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      } catch (error) {
        console.error("Failed to update status", error);
        alert(error?.response?.data?.message || "Failed to update user status");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await adminService.deleteUser(id);
        fetchCustomers(meta.page, search);
      } catch (error) {
        console.error("Failed to delete user", error);
        alert(error?.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      role: customer.role || 'Customer'
    });
  };

  const handleSaveEdit = async () => {
    try {
      await adminService.updateUser({ id: editingCustomer.id, ...editForm });
      setEditingCustomer(null);
      fetchCustomers(meta.page, search);
    } catch (error) {
      console.error("Failed to update user", error);
      alert("Failed to update user");
    }
  };

  return (
    <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-nexus-border">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-info/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
          />
          <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto">
          <Filter size={16} /> Filter
        </button>
        <select
          value={loginFilter}
          onChange={(e) => setLoginFilter(e.target.value)}
          className="px-3 py-2.5 bg-nexus-surface border border-nexus-border rounded-lg text-sm text-nexus-heading focus:outline-none focus:ring-2 focus:ring-nexus-info/50 w-full sm:w-auto"
        >
          <option value="all">All accounts</option>
          <option value="logged_in">Have logged in</option>
          <option value="never">Never logged in</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total Orders</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-nexus-textSecondary">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-nexus-textSecondary">No customers found.</td>
              </tr>
            ) : customers.map((customer) => (
              <tr 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {customer.avatar_url || customer.profile_image || customer.image_url ? (
                      <img 
                        src={customer.avatar_url || customer.profile_image || customer.image_url} 
                        alt={customer.first_name} 
                        className="w-10 h-10 rounded-full object-cover border border-nexus-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-nexus-info/10 dark:bg-nexus-info/20 text-nexus-info flex items-center justify-center font-bold shrink-0">
                        {customer.first_name ? customer.first_name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-nexus-heading">{customer.first_name} {customer.last_name}</h4>
                      <p className="text-xs text-nexus-muted">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-nexus-muted font-medium">
                  {customer.total_orders}
                </td>
                <td className="px-6 py-4 font-semibold text-nexus-heading">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="px-6 py-4 text-nexus-muted capitalize">
                  {customer.role.replace('_', ' ')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE(customer.status)}`}>
                    {customer.status === 'Active' ? 'Active' : customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-nexus-muted font-medium whitespace-nowrap">
                  {customer.last_sign_in_at ? getRelativeTime(customer.last_sign_in_at) : 'Never logged in'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {customer.role !== 'super_admin' && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(customer.id, customer.status); }}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.status === 'approved' 
                              ? 'text-nexus-error hover:text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10' 
                              : 'text-nexus-success hover:text-nexus-success hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10'
                          }`} 
                          title={customer.status === 'approved' ? 'Suspend User' : 'Approve User'}
                        >
                          {customer.status === 'approved' ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(customer); }} className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors" title="Edit User">
                          <Edit size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="p-2 text-nexus-textSecondary hover:text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg transition-colors" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-muted">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-nexus-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-nexus-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-nexus-heading">Edit User</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-nexus-textSecondary hover:text-nexus-muted dark:hover:text-nexus-textSecondary">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">First Name</label>
                <input type="text" value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2 text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">Last Name</label>
                <input type="text" value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2 text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2 text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50">
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingCustomer(null)} className="px-4 py-2 text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-lg transition-colors shadow-lg shadow-primary/30">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-nexus-card shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-nexus-border">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <h3 className="text-xl font-bold text-nexus-heading">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-nexus-textSecondary hover:text-nexus-muted dark:hover:text-nexus-textSecondary">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-8">
                {selectedCustomer.avatar_url || selectedCustomer.profile_image || selectedCustomer.image_url ? (
                  <img 
                    src={selectedCustomer.avatar_url || selectedCustomer.profile_image || selectedCustomer.image_url} 
                    alt={selectedCustomer.first_name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-nexus-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-nexus-info/10 dark:bg-nexus-info/20 text-nexus-info flex items-center justify-center text-2xl font-bold">
                    {selectedCustomer.first_name ? selectedCustomer.first_name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-nexus-heading">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p className="text-nexus-muted">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-nexus-surface rounded-xl">
                  <p className="text-sm text-nexus-muted mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-nexus-heading">{selectedCustomer.total_orders}</p>
                </div>
                <div className="p-4 bg-nexus-surface rounded-xl">
                  <p className="text-sm text-nexus-muted mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-nexus-heading">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div className="p-4 bg-nexus-surface rounded-xl">
                  <p className="text-sm text-nexus-muted mb-1">Role</p>
                  <p className="text-sm font-semibold text-nexus-heading capitalize">{selectedCustomer.role}</p>
                </div>
                <div className="p-4 bg-nexus-surface rounded-xl">
                  <p className="text-sm text-nexus-muted mb-1">Date Joined</p>
                  <p className="text-sm font-semibold text-nexus-heading">
                    {formatDate(selectedCustomer.created_at)}
                  </p>
                </div>
                <div className="p-4 bg-nexus-surface rounded-xl">
                  <p className="text-sm text-nexus-muted mb-1">Last Login</p>
                  <p className="text-sm font-semibold text-nexus-heading">
                    {selectedCustomer.last_sign_in_at ? formatDate(selectedCustomer.last_sign_in_at) : 'Never logged in'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-nexus-heading mb-3">Quick Actions</h4>
                <button 
                  onClick={() => { setSelectedCustomer(null); handleEditClick(selectedCustomer); }}
                  className="w-full py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Edit size={16} /> Edit Profile
                </button>
                <button 
                  onClick={() => {
                    handleStatusUpdate(selectedCustomer.id, selectedCustomer.status);
                    setSelectedCustomer(prev => {
                      const isActive = prev.status === 'Active' || prev.status === 'approved';
                      return { ...prev, status: isActive ? 'Suspended' : 'Active' };
                    });
                  }}
                  className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                    selectedCustomer.status === 'Active' || selectedCustomer.status === 'approved'
                      ? 'bg-nexus-error/5 text-nexus-error hover:bg-nexus-error/10 dark:bg-nexus-error/10 dark:text-nexus-error dark:hover:bg-nexus-error/20' 
                      : 'bg-nexus-success/5 text-nexus-success hover:bg-nexus-success/10 dark:bg-nexus-success/10 dark:text-nexus-success dark:hover:bg-nexus-success/20'
                  }`}
                >
                  {selectedCustomer.status === 'Active' || selectedCustomer.status === 'approved' ? <><Ban size={16} /> Suspend Account</> : <><CheckCircle size={16} /> Activate Account</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerTable;
