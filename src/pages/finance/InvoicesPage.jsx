import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = !['Admin', 'Auditor'].includes(user?.role);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await financeService.getInvoices();
      setInvoices(data || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-500">Manage customer invoices</p>
        </div>
        {canEdit && (
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center transition-colors">
            <Plus size={18} className="mr-2" /> Create Invoice
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search invoices..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{invoice.invoice_number}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{invoice.profiles?.full_name || 'N/A'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">KSh {Number(invoice.amount).toLocaleString()}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">KSh {Number(invoice.balance).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        invoice.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Eye size={16} /></button>
                      {canEdit && (
                        <>
                          <button className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><Edit2 size={16} /></button>
                          <button className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
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

export default InvoicesPage;
