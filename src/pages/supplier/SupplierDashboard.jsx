import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, CheckCircle, FileText, Plus } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';

const SupplierDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSupplierStats = async () => {
      if (!user) return;
      try {
        const { data: supplier } = await supabase.from('suppliers').select('id').eq('user_id', user.id).single();
        if (supplier) {
           const { count: productsCount } = await supabase.from('supplier_products').select('*', { count: 'exact', head: true }).eq('supplier_id', supplier.id);
           setStats({ products: productsCount || 0, orders: 0 });
        }
      } catch (err) {
        // Handle error quietly
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierStats();
  }, [user]);

  const kpis = [
    { label: 'Products Supplied', value: stats.products, color: 'text-success', bg: 'bg-success/10 dark:bg-success/100/10', icon: Package },
    { label: 'Pending POs', value: stats.orders, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10', icon: FileText },
    { label: 'Completed Deliveries', value: 0, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Supplier Partner Dashboard</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Welcome back, {user?.company_name || user?.full_name}</p>
        </div>
        <Link to="/supplier/orders" className="inline-flex items-center gap-2 bg-success hover:bg-success text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-success/20">
          <FileText size={18} /> View Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-nexus-card p-5 rounded-2xl border border-nexus-border shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-nexus-muted">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-nexus-heading mt-1">
                {loading ? '-' : kpi.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent POs Widget */}
        <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 text-nexus-heading font-bold">
                <FileText className="text-success" size={20} /> Recent Purchase Orders
             </div>
             <Link to="/supplier/orders" className="text-xs font-bold text-success hover:text-success">View All</Link>
           </div>
           
           <div className="space-y-4">
              <div className="text-center p-6 text-nexus-textSecondary text-sm bg-nexus-surface dark:bg-nexus-hover rounded-xl">
                Purchase orders will appear here once assigned to you by the warehouse.
              </div>
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
           <h3 className="font-bold text-nexus-heading mb-4">Supplier Actions</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link to="/supplier/orders" className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-center hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
               <Package className="mx-auto text-success mb-2" />
               <p className="text-sm font-medium text-nexus-heading">Products</p>
             </Link>
             <div className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-center opacity-50 cursor-not-allowed">
               <Building2 className="mx-auto text-nexus-success mb-2" />
               <p className="text-sm font-medium text-nexus-heading">Profile</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
