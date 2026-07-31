import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = !['Admin', 'Auditor'].includes(user?.role);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await financeService.getPayments();
      setPayments(data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading">Payments</h1>
          <p className="text-nexus-textSecondary">Record and manage received payments</p>
        </div>
        {canEdit && (
          <button className="bg-nexus-error hover:bg-nexus-error text-white px-4 py-2 rounded-xl flex items-center transition-colors">
            <Plus size={18} className="mr-2" /> Record Payment
          </button>
        )}
      </div>

      <div className="bg-nexus-card rounded-2xl shadow-sm border border-nexus-border overflow-hidden">
        <div className="p-4 border-b border-nexus-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={20} />
            <input type="text" placeholder="Search payments..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-nexus-border bg-nexus-surface text-nexus-heading focus:ring-2 focus:ring-nexus-error" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-nexus-surface/50 text-nexus-muted text-sm">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">No payments found.</td></tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">
                    <td className="p-4 text-nexus-muted">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-nexus-heading">{payment.finance_invoices?.invoice_number || 'N/A'}</td>
                    <td className="p-4 text-nexus-muted">{payment.profiles?.full_name || 'N/A'}</td>
                    <td className="p-4 font-bold text-nexus-heading">KSh {Number(payment.amount).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-textSecondary">
                        {payment.method}
                      </span>
                    </td>
                    <td className="p-4 text-nexus-muted">{payment.reference || '-'}</td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg"><Eye size={16} /></button>
                      {canEdit && (
                        <>
                          <button className="p-1.5 text-nexus-info hover:bg-nexus-info/10 dark:hover:bg-nexus-info/10 rounded-lg"><Edit2 size={16} /></button>
                          <button className="p-1.5 text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg"><Trash2 size={16} /></button>
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

export default PaymentsPage;
