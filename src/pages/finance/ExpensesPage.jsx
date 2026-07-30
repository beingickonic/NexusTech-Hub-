import React, { useState, useEffect } from 'react';
import { Receipt, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter]);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.expenses.getExpenses({ status: statusFilter, search: searchTerm });
    if (!error && data) {
      setExpenses(data);
    } else {
      toast.error('Failed to load Expenses');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const updateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading('Updating status...');
    const { error } = await financeErpService.expenses.updateExpenseStatus(id, newStatus);
    if (!error) {
      toast.success('Status updated', { id: loadingToast });
      fetchExpenses();
    } else {
      toast.error('Failed to update', { id: loadingToast });
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Company Expenses</h1>
        <p className="text-slate-500 dark:text-slate-400">Track and approve operational expenses.</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button 
                type="button"
                onClick={fetchExpenses}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="animate-spin" size={24} />
                      Loading expenses...
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Receipt size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No expenses found.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md inline-block">
                        {exp.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} KES
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exp.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        exp.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {exp.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(exp.id, 'Approved')}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateStatus(exp.id, 'Rejected')}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
