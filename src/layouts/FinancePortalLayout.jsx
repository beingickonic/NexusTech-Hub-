import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, BookOpen, CreditCard, FileText, Landmark, ReceiptText,
  Settings, TrendingUp, Wallet
} from 'lucide-react';
import PortalNavbar from '../components/portal/PortalNavbar';
import PortalSidebar from '../components/portal/PortalSidebar';

const financeConfig = {
  name: 'Finance',
  accentHex: '#2563eb',
  homeRoute: '/finance/dashboard',
  icon: Landmark,
  nav: [
    { name: 'Dashboard', path: '/finance/dashboard', icon: TrendingUp },
    { name: 'Chart of Accounts', path: '/finance/chart-of-accounts', icon: FileText },
    { name: 'General Ledger', path: '/finance/general-ledger', icon: BookOpen },
    { name: 'Accounts Receivable', path: '/finance/accounts-receivable', icon: CreditCard },
    { name: 'Accounts Payable', path: '/finance/accounts-payable', icon: Wallet },
    { name: 'Finance Invoices', path: '/finance/invoices', icon: ReceiptText },
    { name: 'Customer Payments', path: '/finance/customer-payments', icon: CreditCard },
    { name: 'Expenses', path: '/finance/expenses', icon: Wallet },
    { name: 'Reports', path: '/finance/reports', icon: BarChart3 },
    { name: 'Settings', path: '/finance/settings', icon: Settings }
  ]
};

const FinancePortalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">
      <PortalSidebar config={financeConfig} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:ml-60 flex min-h-screen flex-col">
        <PortalNavbar config={financeConfig} toggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={window.location.hash} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default FinancePortalLayout;
