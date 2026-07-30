import { Building2, Settings } from 'lucide-react';

const FinanceSettingsPage = () => (
  <div className="max-w-3xl space-y-6">
    <div><h1 className="text-3xl font-extrabold">Finance Settings</h1><p className="mt-1 text-slate-500">Configure defaults used across finance operations.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Building2 /></div><div><h2 className="font-bold">Company finance defaults</h2><p className="text-sm text-slate-500">Currency and accounting preferences.</p></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Base currency<input readOnly value="KES" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600 dark:border-slate-700 dark:bg-slate-900" /></label><label className="text-sm font-medium">Accounting period<input readOnly value="Monthly" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600 dark:border-slate-700 dark:bg-slate-900" /></label></div>
      <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Settings size={16} /> Defaults are managed by your finance administrator.</p>
    </div>
  </div>
);
export default FinanceSettingsPage;
