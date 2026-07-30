import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let networkListener;

    const setupNetworkListener = async () => {
      // Check initial status
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      // Listen for changes
      networkListener = await Network.addListener('networkStatusChange', (status) => {
        setIsOffline(!status.connected);
      });
    };

    setupNetworkListener();

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <WifiOff size={20} />
          <span className="font-medium text-sm md:text-base">
            You are currently offline. Some features may be unavailable.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusBanner;
