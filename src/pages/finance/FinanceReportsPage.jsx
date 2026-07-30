import { useState } from 'react';
import { Download } from 'lucide-react';
import { financePortalService } from '../../services/financePortalService';

const FinanceReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const download = async () => { setLoading(true); const result = await financePortalService.dashboard(); const rows = [['Type','Date','Description','Amount'], ...(result.data.transactions || []).map(row => [row.type, row.date, row.description, row.amount])]; const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"','""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `finance-report-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(link.href); setLoading(false); };
  return <div className="max-w-2xl space-y-6"><div><h1 className="text-3xl font-extrabold">Reports</h1><p className="mt-1 text-slate-500">Export finance activity as a CSV file.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"><h2 className="font-bold">Finance activity report</h2><p className="mt-1 text-sm text-slate-500">Payments and expenses, ready for spreadsheet analysis.</p><button disabled={loading} onClick={download} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"><Download size={17}/>{loading ? 'Preparing…' : 'Export CSV'}</button></div></div>;
};
export default FinanceReportsPage;
