import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PortalSidebar from './PortalSidebar';
import PortalNavbar from './PortalNavbar';

const PortalLayout = ({ config }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(`${config.name.toLowerCase()}-sidebar-collapsed`) === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsCollapsed(localStorage.getItem(`${config.name.toLowerCase()}-sidebar-collapsed`) === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [config.name]);

  return (
    <div className="min-h-screen bg-nexus-surface dark:bg-nexus-bg text-nexus-heading font-sans">
      <PortalSidebar
        config={config}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className={`${isCollapsed ? 'lg:ml-20' : 'lg:ml-60'} flex flex-col min-h-screen transition-all duration-300`}>
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
