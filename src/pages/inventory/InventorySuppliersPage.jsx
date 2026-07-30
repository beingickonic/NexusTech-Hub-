import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Mail, Phone, MapPin, ExternalLink, Star, Package, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

const InventorySuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('company_name', { ascending: true });
        
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load suppliers');
      // Fallback dummy data if table is empty or errors
      if (suppliers.length === 0) {
        setSuppliers([
          { id: 1, company_name: 'Acme Electronics', contact_person: 'John Smith', email: 'john@acme.com', phone: '+1 555-0100', category: 'Electronics', rating: 4.8 },
          { id: 2, company_name: 'Global Office Supplies', contact_person: 'Sarah Johnson', email: 'sarah@globaloffice.com', phone: '+1 555-0122', category: 'Stationery', rating: 4.5 },
          { id: 3, company_name: 'TechGear Pro', contact_person: 'Mike Davis', email: 'mike@techgear.net', phone: '+1 555-0199', category: 'IT Equipment', rating: 4.9 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supplier Directory</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">View approved suppliers and contact information</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSuppliers} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary hover:text-primary transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search suppliers by name, contact, or category..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-nexus-border text-sm outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white shadow-sm" 
        />
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border p-6 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border">
          <Building2 size={48} className="mx-auto mb-4 text-nexus-textSecondary opacity-50" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No suppliers found</h3>
          <p className="text-sm text-nexus-textSecondary">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier, i) => (
            <motion.div 
              key={supplier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border p-6 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{supplier.company_name}</h3>
                    <p className="text-xs font-medium text-primary mt-0.5">{supplier.category || 'General Supplier'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star size={12} fill="currentColor" /> {supplier.rating || 'N/A'}
                </div>
              </div>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-nexus-textSecondary">
                  <User size={14} className="text-slate-400" />
                  <span className="truncate">{supplier.contact_person || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-nexus-textSecondary">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${supplier.email}`} className="truncate hover:text-primary transition-colors">{supplier.email || 'N/A'}</a>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-nexus-textSecondary">
                  <Phone size={14} className="text-slate-400" />
                  <span className="truncate">{supplier.phone || 'N/A'}</span>
                </div>
                {supplier.address && (
                  <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-nexus-textSecondary">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary">
                  <Package size={14} />
                  <span>{supplier.total_orders || 0} orders</span>
                </div>
                <button className="text-xs font-bold text-primary hover:text-orange-600 transition-colors flex items-center gap-1">
                  View Catalog <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventorySuppliersPage;
