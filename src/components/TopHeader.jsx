import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin } from 'lucide-react';

const TopHeader = () => {
  return (
    <div className="bg-gradient-cinematic text-white py-2 px-4 text-sm font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary shadow-glow"
          />
          <span>Free shipping on all orders over Ksh 5,000</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <span>30-day guarantee</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <Link to="/contact" className="flex items-center gap-2 hover:text-white transition-colors">
            <MapPin size={16} />
            <span>Track Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
