import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const ExpensesPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = !['Admin', 'Auditor'].includes(user?.role);
  const canApprove = ['Finance_Director', 'Finance_Manager', 'super_admin'].includes(user?.role);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await financeService.getExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success';
      case 'Rejected': return 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error';
      case 'Submitted': return 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info';
      case 'Paid': return 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info';
      default: return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-textSecondary'; // Draft
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading">Expenses</h1>
          <p className="text-nexus-textSecondary">Manage business expenses and approvals</p>
        </div>
        {canEdit && (
          <button className="bg-nexus-error hover:bg-nexus-error text-white px-4 py-2 rounded-xl flex items-center transition-colors">
            <Plus size={18} className="mr-2" /> Add Expense
          </button>
        )}
      </div>

      <div className="bg-nexus-card rounded-2xl shadow-sm border border-nexus-border overflow-hidden">
        <div className="p-4 border-b border-nexus-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={20} />
            <input type="text" placeholder="Search expenses..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-nexus-border bg-nexus-surface text-nexus-heading focus:ring-2 focus:ring-nexus-error" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-nexus-surface/50 text-nexus-muted text-sm">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">No expenses found.</td></tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">
                    <td className="p-4 text-nexus-muted">{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-nexus-heading">{expense.category}</td>
                    <td className="p-4 text-nexus-muted">{expense.vendor || '-'}</td>
                    <td className="p-4 text-nexus-muted max-w-xs truncate" title={expense.description}>{expense.description || '-'}</td>
                    <td className="p-4 font-bold text-nexus-heading">KSh {Number(expense.amount).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button title="View" className="p-1.5 text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg"><Eye size={16} /></button>
                      
                      {canApprove && expense.status === 'Submitted' && (
                        <>
                          <button title="Approve" className="p-1.5 text-nexus-success hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10 rounded-lg"><CheckCircle size={16} /></button>
                          <button title="Reject" className="p-1.5 text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg"><XCircle size={16} /></button>
                        </>
                      )}
                      
                      {canEdit && (
                        <>
                          <button title="Edit" className="p-1.5 text-nexus-info hover:bg-nexus-info/10 dark:hover:bg-nexus-info/10 rounded-lg"><Edit2 size={16} /></button>
                          <button title="Delete" className="p-1.5 text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg"><Trash2 size={16} /></button>
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
