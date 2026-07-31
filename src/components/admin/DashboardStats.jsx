import React from 'react';
import { DollarSign, ShoppingCart, Users, AlertCircle, TrendingUp, Mail, Headset } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
  const cards = [
    {
      title: 'Revenue Today',
      value: `KES ${stats?.revenue?.toLocaleString() || 0}`,
      subtitle: '+12% from yesterday',
      trend: 'up',
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      title: 'Orders Today',
      value: stats?.orders || 0,
      subtitle: '+5% from yesterday',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
    },
    {
      title: 'New Customers',
      value: stats?.customers || 0,
      subtitle: 'This month',
      trend: 'neutral',
      icon: Users,
      color: 'text-nexus-info',
      bg: 'bg-nexus-info/10',
      border: 'border-nexus-info/20',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 9,
      subtitle: 'Needs Attention',
      trend: 'warning',
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
    {
      title: 'Cash Orders',
      value: stats?.cashOrders ?? 0,
      subtitle: 'Manual payments',
      trend: 'warning',
      icon: DollarSign,
      color: 'text-info',
      bg: 'bg-info/100/10',
      border: 'border-info/20',
    },
    {
      title: 'Active Tickets',
      value: stats?.tickets ?? 0,
      subtitle: 'Needs Attention',
      trend: 'warning',
      icon: Headset,
      color: 'text-nexus-error',
      bg: 'bg-nexus-error/10',
      border: 'border-error/20',
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8"
    >
      {cards.map((card, index) => (
        <motion.div 
          key={index} 
          variants={item}
          className={`${index === cards.length - 1 && cards.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''} bg-nexus-card backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-nexus-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
        >
          {/* Decorative background blur */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.bg} blur-2xl opacity-30 md:opacity-50 group-hover:opacity-100 transition-opacity`}></div>
          
          <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
            <h3 className="text-[10px] md:text-sm font-semibold text-nexus-muted uppercase tracking-wider">{card.title}</h3>
            <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl border ${card.bg} ${card.color} ${card.border}`}>
              <card.icon size={16} className="md:w-5 md:h-5" />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-end gap-2 md:gap-3">
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-nexus-heading truncate">
                {card.value}
              </h2>
            </div>
            
            <div className="mt-1 md:mt-2 flex items-center gap-1 text-[10px] md:text-sm">
              {card.trend === 'up' && <TrendingUp size={12} className="text-success md:w-3.5 md:h-3.5" />}
              {card.trend === 'warning' && <AlertCircle size={12} className="text-warning md:w-3.5 md:h-3.5" />}
              <span className={`${
                card.trend === 'up' ? 'text-success font-medium' :
                card.trend === 'warning' ? 'text-warning font-medium' :
                'text-nexus-muted font-medium'
              } truncate`}>
                {card.subtitle}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;
