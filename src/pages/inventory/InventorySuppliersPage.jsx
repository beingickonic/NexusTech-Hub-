import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Mail, Phone, MapPin, ExternalLink, Star, Package, RefreshCw, User, UserCheck, CheckCircle, X, AlertTriangle, Package as PackageIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-nexus-heading">Supplier Directory</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">View approved suppliers and contact information</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSuppliers} className="p-2.5 rounded-xl bg-nexus-card border border-nexus-border text-nexus-muted hover:text-primary transition-colors">
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
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-nexus-card border border-nexus-border text-sm outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading shadow-sm" 
        />
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-nexus-card rounded-2xl border border-nexus-border p-6 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-nexus-surface rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-nexus-surface rounded w-3/4" />
                  <div className="h-3 bg-nexus-surface rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="h-3 bg-nexus-surface rounded w-full" />
                <div className="h-3 bg-nexus-surface rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 && !loading ? (
        <div className="text-center py-20 bg-nexus-card rounded-2xl border border-nexus-border">
          <AlertTriangle size={48} className="mx-auto mb-4 text-nexus-error opacity-50" />
          <h3 className="text-lg font-bold text-nexus-heading mb-2">No suppliers found</h3>
          <p className="text-sm text-nexus-textSecondary mb-4">The suppliers table appears to be empty in the database.</p>
          <p className="text-xs text-nexus-textSecondary">Please check if the suppliers table exists and has data.</p>
        </div>
      ) : filteredSuppliers.length === 0 && suppliers.length > 0 && !loading ? (
        <div className="text-center py-16 bg-nexus-card rounded-2xl border border-nexus-border">
          <AlertTriangle size={48} className="mx-auto mb-4 text-nexus-muted opacity-50" />
          <h3 className="text-lg font-bold text-nexus-heading mb-2">No suppliers match your search</h3>
          <p className="text-sm text-nexus-textSecondary">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSuppliers.map((supplier, i) => (
            <motion.div 
              key={supplier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-nexus-card rounded-2xl border border-nexus-border p-6 hover:shadow-lg dark:hover:shadow-nexus-dark-navy/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-nexus-heading line-clamp-1">{supplier.company_name}</h3>
                    <p className="text-xs font-medium text-primary mt-0.5">{supplier.category || 'General Supplier'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-nexus-gold/10 dark:bg-nexus-gold/10 text-nexus-gold px-2 py-1 rounded-lg text-xs font-bold">
                  <Star size={12} fill="currentColor" /> {supplier.rating || 'N/A'}
                </div>
              </div>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-nexus-muted">
                  <User size={14} className="text-nexus-muted" />
                  <span className="truncate">{supplier.contact_person || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-nexus-muted">
                  <Mail size={14} className="text-nexus-muted" />
                  <a href={`mailto:${supplier.email}`} className="truncate hover:text-primary transition-colors">{supplier.email || 'N/A'}</a>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-nexus-muted">
                  <Phone size={14} className="text-nexus-muted" />
                  <span className="truncate">{supplier.phone || 'N/A'}</span>
                </div>
                {supplier.address && (
                  <div className="flex items-start gap-2.5 text-sm text-nexus-muted">
                    <MapPin size={14} className="text-nexus-muted shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary">
                  <Package size={14} />
                  <span>{supplier.total_orders || 0} orders</span>
                </div>
                <button
                  onClick={() => handleContactSupplier(supplier)}
                  className="text-xs font-bold text-primary hover:text-nexus-primary transition-colors flex items-center gap-1"
                >
                  Contact Supplier <MessageSquare size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Contact Supplier Modal Component
const ContactSupplierModal = ({ supplier, isOpen, onClose, onSubmit, message, setMessage, submitting }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => !submitting && onClose()}
      >
        <motion.div
          className="bg-white dark:bg-nexus-card w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-border">
            <div>
              <h3 className="text-lg font-semibold text-nexus-heading">Contact Supplier</h3>
              <p className="text-sm text-nexus-textSecondary mt-1">Reach out to {supplier.company_name}</p>
            </div>
            <button onClick={() => !submitting && onClose()} className="text-nexus-textSecondary hover:text-nexus-heading">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="bg-nexus-surface/50 dark:bg-nexus-hover rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-nexus-muted" />
                <div>
                  <p className="text-sm font-medium text-nexus-heading">{supplier.company_name}</p>
                  <p className="text-xs text-nexus-textSecondary">{supplier.category}</p>
                </div>
              </div>
              
              {supplier.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-nexus-muted" />
                  <a href={`mailto:${supplier.email}`} className="text-sm text-nexus-textSecondary hover:text-primary transition-colors">
                    {supplier.email}
                  </a>
                </div>
              )}
              
              {supplier.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-nexus-muted" />
                  <span className="text-sm text-nexus-textSecondary">{supplier.phone}</span>
                </div>
              )}
              
              {supplier.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-nexus-muted shrink-0 mt-0.5" />
                  <span className="text-sm text-nexus-textSecondary">{supplier.address}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-nexus-textSecondary">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message to the supplier..."
                className="mt-1 w-full px-4 py-3 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-nexus-border flex justify-end gap-3">
            <button
              onClick={() => !submitting && onClose()}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-nexus-surface text-nexus-text border border-nexus-border hover:bg-nexus-hover disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-nexus-primary hover:bg-nexus-primary-hover text-white disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Mail size={16} /> Send Message
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InventorySuppliersPage;

export { ContactSupplierModal };
