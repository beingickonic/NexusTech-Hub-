import { useState, useEffect } from 'react';
import { Search, Filter, Ban, CheckCircle, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import { adminService } from '../../services/adminService';

const CustomerTable = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' });

  const fetchCustomers = async (currentPage = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const response = await adminService.getCustomers({ page: currentPage, search: searchQuery });
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
      fetchCustomers(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchCustomers(newPage, search);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
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
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-nexus-border">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-nexus-textSecondary text-slate-900 dark:text-white"
          />
          <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 w-full sm:w-auto">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-nexus-surface/50 text-nexus-textSecondary dark:text-nexus-textSecondary text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-nexus-border">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total Orders</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">No customers found.</td>
              </tr>
            ) : customers.map((customer) => (
              <tr 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {customer.avatar_url || customer.profile_image || customer.image_url ? (
                      <img 
                        src={customer.avatar_url || customer.profile_image || customer.image_url} 
                        alt={customer.first_name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-nexus-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                        {customer.first_name ? customer.first_name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{customer.first_name} {customer.last_name}</h4>
                      <p className="text-xs text-nexus-textSecondary dark:text-nexus-textSecondary">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary font-medium">
                  {customer.total_orders}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="px-6 py-4 text-nexus-textSecondary dark:text-nexus-textSecondary capitalize">
                  {customer.role.replace('_', ' ')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                    customer.status === 'approved' 
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                      : customer.status === 'pending'
                      ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {customer.role !== 'super_admin' && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(customer.id, customer.status); }}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.status === 'approved' 
                              ? 'text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                              : 'text-green-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                          }`} 
                          title={customer.status === 'approved' ? 'Suspend User' : 'Approve User'}
                        >
                          {customer.status === 'approved' ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(customer); }} className="p-2 text-nexus-textSecondary hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors" title="Edit User">
                          <Edit size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="p-2 text-nexus-textSecondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
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
      
      <div className="p-4 border-t border-slate-200 dark:border-nexus-border flex items-center justify-between text-sm text-nexus-textSecondary dark:text-nexus-textSecondary">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-nexus-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-nexus-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-nexus-textSecondary hover:text-slate-600 dark:hover:text-nexus-textSecondary">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">First Name</label>
                <input type="text" value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-nexus-border rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Last Name</label>
                <input type="text" value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-nexus-border rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-nexus-border rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50">
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingCustomer(null)} className="px-4 py-2 text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-lg shadow-orange-500/30">Save Changes</button>
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
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-nexus-surface shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-slate-200 dark:border-nexus-border">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-nexus-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-nexus-textSecondary hover:text-slate-600 dark:hover:text-nexus-textSecondary">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-8">
                {selectedCustomer.avatar_url || selectedCustomer.profile_image || selectedCustomer.image_url ? (
                  <img 
                    src={selectedCustomer.avatar_url || selectedCustomer.profile_image || selectedCustomer.image_url} 
                    alt={selectedCustomer.first_name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-nexus-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
                    {selectedCustomer.first_name ? selectedCustomer.first_name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedCustomer.total_orders}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-1">Role</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{selectedCustomer.role}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-1">Date Joined</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(selectedCustomer.created_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h4>
                <button 
                  onClick={() => { setSelectedCustomer(null); handleEditClick(selectedCustomer); }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Edit size={16} /> Edit Profile
                </button>
                <button 
                  onClick={() => {
                    handleStatusUpdate(selectedCustomer.id, selectedCustomer.status);
                    setSelectedCustomer(prev => ({ ...prev, status: prev.status === 'suspended' ? 'approved' : 'suspended' }));
                  }}
                  className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                    selectedCustomer.status === 'approved' 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'
                  }`}
                >
                  {selectedCustomer.status === 'approved' ? <><Ban size={16} /> Suspend Account</> : <><CheckCircle size={16} /> Approve Account</>}
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
