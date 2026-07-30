import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RefreshCw } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import toast from 'react-hot-toast';

const CustomerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.payments.getCustomerPayments({ search: searchTerm });
    if (!error && data) {
      setPayments(data);
    } else {
      toast.error('Failed to load Payments');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Customer Payments</h1>
        <p className="text-slate-500 dark:text-slate-400">Track incoming customer payments across all methods.</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search Reference Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <button 
              type="button"
              onClick={fetchPayments}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="animate-spin" size={24} />
                      Loading payments...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No payments found.</p>
                  </td>
                </tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md inline-block">
                        {pay.reference_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {pay.profiles?.full_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {pay.finance_invoices?.invoice_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {pay.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(pay.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                      +{Number(pay.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} KES
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

export default CustomerPaymentsPage;
