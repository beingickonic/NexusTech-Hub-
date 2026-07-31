import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Receipt, FolderOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-nexus-primary/10 flex items-center justify-center mb-5">
      <FolderOpen size={36} className="text-nexus-primary/60" />
    </div>
    <h3 className="text-nexus-heading font-semibold text-lg mb-2">No assets yet</h3>
    <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm max-w-xs">
      Your invoices and receipts will appear here after your first order is completed.
    </p>
  </motion.div>
);

const AssetCard = ({ invoice }) => {
  const date = new Date(invoice.created_at).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-5 bg-white dark:bg-nexus-bg border border-nexus-border dark:border-nexus-card rounded-xl hover:border-nexus-primary/30 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-nexus-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText size={22} className="text-nexus-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-nexus-heading font-semibold text-sm truncate">Invoice #{invoice.invoice_number}</p>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs mt-0.5">Order #{invoice.order_id} · {date}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {invoice.pdf_url && (
          <>
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-nexus-textSecondary dark:text-nexus-muted hover:text-nexus-heading hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-all"
              title="View Invoice"
            >
              <ExternalLink size={15} />
            </a>
            <a
              href={invoice.pdf_url}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nexus-primary/10 hover:bg-nexus-primary/20 text-nexus-primary text-xs font-semibold transition-colors border border-nexus-primary/20"
            >
              <Download size={13} /> Download
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
};

const AssetsSection = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAssets = async () => {
      setLoading(true);
      // Get user's order IDs first (RLS: invoices are visible via order ownership)
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false });
        setInvoices(data || []);
      }
      setLoading(false);
    };
    fetchAssets();
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nexus-heading">My Assets</h1>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm mt-1">Download your invoices and receipts</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Total Invoices', value: invoices.length, icon: FileText },
          { label: 'Total Receipts', value: invoices.length, icon: Receipt },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-nexus-primary/10 flex items-center justify-center">
              <stat.icon size={20} className="text-nexus-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-nexus-heading">{stat.value}</p>
              <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => <AssetCard key={inv.id} invoice={inv} />)}
        </div>
      )}
    </motion.div>
  );
};

export default AssetsSection;
