import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, CheckCircle2, XCircle, Clock, ClipboardCheck } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const GoodsReceivedPage = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGrns = async () => {
    setLoading(true);
    try {
      const { success, data } = await inventoryService.getPurchaseRequests();
      if (success) {
        const mapped = data.map(pr => ({
          id: pr.id,
          supplier: pr.suppliers?.name || 'Unknown Supplier',
          poReference: pr.product_id ? `PROD-${pr.product_id.substring(0, 6)}` : 'PO-N/A',
          date: pr.created_at,
          status: pr.status?.toLowerCase() || 'pending',
          items: pr.quantity || 0,
          receivedBy: pr.profiles?.full_name || null,
          productTitle: pr.products?.title || 'Unknown Product'
        }));
        setGrns(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrns();
  }, []);

  const handleReceive = async (grn) => {
    if (!window.confirm(`Receive ${grn.items} units of ${grn.productTitle}?`)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Get a default warehouse
      const { data: whData } = await supabase.from('warehouse_locations').select('id').limit(1).single();
      if (!whData) {
         alert("No warehouse found to receive goods into.");
         return;
      }
      await inventoryService.receiveGoods(grn.id, whData.id, grn.items, user?.id);
      await fetchGrns();
    } catch (error) {
      console.error(error);
      alert("Failed to receive goods.");
    }
  };

  const filteredGrns = grns.filter(g => 
    g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.poReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
      case 'received':
      case 'completed':
      case 'accepted':
        return <span className="inline-flex items-center gap-1 bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle2 size={14}/> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'rejected': 
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error px-2.5 py-1 rounded-md text-xs font-semibold"><XCircle size={14}/> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      case 'pending':
      case 'awaiting_approval':
      default:
        return <span className="inline-flex items-center gap-1 bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14}/> Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Goods Received Notes (GRN)</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Inspect, accept, or reject incoming supplier deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-primary hover:bg-nexus-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <ClipboardCheck size={18} /> New GRN
          </button>
        </div>
      </div>

      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-nexus-surface/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={20} />
            <input 
              type="text" 
              placeholder="Search GRN, Supplier, or PO..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading placeholder-nexus-muted"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-nexus-hover border border-nexus-border px-4 py-2 rounded-xl text-sm font-medium text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors w-full sm:w-auto justify-center">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nexus-surface dark:bg-white/[0.02] border-b border-nexus-border">
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">GRN Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Supplier & PO</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-white/10">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="h-10 w-32 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-10 w-48 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-24 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredGrns.length > 0 ? (
                filteredGrns.map((grn) => (
                  <motion.tr 
                    key={grn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-nexus-heading">{grn.id}</p>
                      <p className="text-xs text-nexus-textSecondary mt-0.5">{new Date(grn.date).toLocaleDateString()} • {grn.items} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-nexus-heading">{grn.supplier}</p>
                      <p className="text-xs font-mono text-nexus-textSecondary mt-0.5">{grn.poReference}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(grn.status)}
                        {grn.receivedBy && <span className="text-[10px] text-nexus-textSecondary">By {grn.receivedBy}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {grn.status === 'pending' || grn.status === 'awaiting_approval' || grn.status === 'approved' ? (
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleReceive(grn)}
                             className="px-3 py-1.5 bg-nexus-success hover:bg-nexus-success text-white rounded-lg text-sm font-medium transition-colors"
                           >
                             Accept
                           </button>
                           <button className="px-3 py-1.5 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading rounded-lg text-sm font-medium transition-colors">Review</button>
                         </div>
                      ) : (
                        <button className="p-2 text-nexus-textSecondary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-nexus-textSecondary">
                    <ClipboardCheck size={48} className="mx-auto text-nexus-textSecondary dark:text-nexus-muted mb-3" />
                    <p className="text-base font-medium">No GRNs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoodsReceivedPage;
