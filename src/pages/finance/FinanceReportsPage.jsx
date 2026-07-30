import { BarChart3, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinanceReportsPage = () => (
  <div className="space-y-6">
    <div><h1 className="text-3xl font-extrabold">Financial Reports</h1><p className="mt-1 text-slate-500">Review the books and operational finance activity.</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ['Profit & Loss', 'Revenue, expenses and gross profit', '/finance/dashboard'],
        ['Receivables Aging', 'Outstanding customer balances', '/finance/accounts-receivable'],
        ['Payables Aging', 'Supplier obligations and due dates', '/finance/accounts-payable']
      ].map(([title, detail, path]) => <Link key={title} to={path} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800"><BarChart3 className="mb-4 text-blue-600" /><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><FileDown size={15} /> Open report</span></Link>)}
    </div>
  </div>
);
export default FinanceReportsPage;
