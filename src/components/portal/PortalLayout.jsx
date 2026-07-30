import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PortalSidebar from './PortalSidebar';
import PortalNavbar from './PortalNavbar';

/**
 * Generic portal layout reused by Dispatch, Driver, Inventory, and Supplier portals.
 *
 * @param {Object} config
 * @param {string} config.name          - Portal name e.g. "Dispatch"
 * @param {string} config.accent        - Tailwind color name e.g. "amber"
 * @param {string} config.accentHex     - Raw hex e.g. "#f59e0b"
 * @param {string} config.homeRoute     - Default dashboard path
 * @param {Array}  config.nav           - Array of { name, path, icon }
 * @param {React.Component} config.icon - Portal icon component
 * @param {string} config.bgClass       - Sidebar background class
 */
const PortalLayout = ({ config }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-nexus-bg text-slate-900 dark:text-white font-sans">
      <PortalSidebar
        config={config}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-60 flex flex-col min-h-screen transition-all duration-300">
        <PortalNavbar
          config={config}
          toggleSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.hash}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
