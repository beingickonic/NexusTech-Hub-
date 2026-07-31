import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Edit, Image as ImageIcon, Barcode, Package, ArrowRightLeft, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

const InventoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // General dropdown for top-right "Adjust Stock" button
  const [allProducts, setAllProducts] = useState([]);

  // Adjust stock states
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Manual stock adjustment');

  // Edit product states
  const [editTitle, setEditTitle] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { success, data } = await inventoryService.getInventoryItems({ search: searchQuery });
      if (success) {
        // map to UI expected format
        const mapped = data.map(p => ({
          id: p.id,
          title: p.title,
          sku: p.sku || 'N/A',
          barcode: p.barcode || 'N/A',
          category: p.category_name || 'Uncategorized',
          price: p.price || 0,
          cost_price: p.cost_price || 0,
          quantity: p.quantity_on_hand || 0,
          reserved: p.quantity_reserved || 0,
          available: p.quantity_available || 0,
          image_url: p.image_url
        }));
        setProducts(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  // Load all products for general adjustment dropdown if opened from the top right
  useEffect(() => {
    if (isAdjustModalOpen && !selectedProduct) {
      inventoryService.getProducts().then(res => {
        if (res.success) setAllProducts(res.data || []);
      });
    }
  }, [isAdjustModalOpen, selectedProduct]);

  const handleOpenAdjust = (product = null) => {
    setSelectedProduct(product);
    if (product) {
      setAdjustQty(product.quantity);
    } else {
      setAdjustQty('');
    }
    setAdjustReason('Manual stock adjustment');
    setIsAdjustModalOpen(true);
  };

  const handleSelectProductInAdjust = (productId) => {
    const prod = allProducts.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct({
        id: prod.id,
        title: prod.title,
        quantity: prod.stock || 0
      });
      setAdjustQty(prod.stock || 0);
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setEditTitle(product.title);
    setEditSku(product.sku);
    setEditPrice(product.price);
    setEditCostPrice(product.cost_price);
    setEditQuantity(product.quantity);
    setIsEditModalOpen(true);
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await inventoryService.adjustStock(selectedProduct.id, Number(adjustQty), user?.id, { notes: adjustReason });
      toast.success('Stock adjusted successfully!');
      setIsAdjustModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const inventoryId = await inventoryService.ensureInventoryRecord(selectedProduct.id);
      
      if (Number(editQuantity) !== selectedProduct.quantity) {
        await inventoryService.adjustStock(selectedProduct.id, Number(editQuantity), user?.id, { notes: 'Quantity changed during product edit' });
      }

      await supabase.from('inventory').update({
        cost_price: Number(editCostPrice),
        updated_at: new Date().toISOString()
      }).eq('id', inventoryId);

      const { error: prodErr } = await supabase.from('products').update({
        title: editTitle,
        sku: editSku,
        price: Number(editPrice),
        stock: Number(editQuantity)
      }).eq('id', selectedProduct.id);

      if (prodErr) throw prodErr;

      toast.success('Product updated successfully!');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Products Inventory</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Manage stock levels, SKUs, and barcodes</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Barcode size={18} /> Scan Barcode
          </button>
          <button 
            onClick={() => handleOpenAdjust(null)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-nexus-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25"
          >
            <ArrowRightLeft size={18} /> Adjust Stock
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
              placeholder="Search by name, SKU, or Barcode..." 
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
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Identifiers</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider text-center">Stock Levels</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-white/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="h-10 w-48 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-32 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-24 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-32 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse mx-auto"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-nexus-surface dark:bg-nexus-hover flex items-center justify-center border border-nexus-border flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <ImageIcon className="text-nexus-textSecondary" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-nexus-heading">{product.title}</p>
                          <p className="text-xs text-nexus-textSecondary mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-nexus-textSecondary uppercase w-8">SKU:</span>
                          <span className="text-sm font-medium text-nexus-muted font-mono bg-nexus-surface dark:bg-nexus-hover px-2 py-0.5 rounded">{product.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-nexus-textSecondary uppercase w-8">UPC:</span>
                          <span className="text-sm text-nexus-muted font-mono">{product.barcode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-nexus-textSecondary uppercase w-10">Sell:</span>
                          <span className="text-sm font-bold text-nexus-heading">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-nexus-textSecondary uppercase w-10">Cost:</span>
                          <span className="text-sm font-medium text-nexus-textSecondary">${product.cost_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-nexus-textSecondary mb-1">Total</p>
                          <span className="text-sm font-bold text-nexus-heading">{product.quantity}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-nexus-textSecondary mb-1">Rsrvd</p>
                          <span className="text-sm font-bold text-nexus-gold">{product.reserved}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-nexus-textSecondary mb-1">Avail</p>
                          <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                            product.available > 10 ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' :
                            product.available > 0 ? 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold' :
                            'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'
                          }`}>
                            {product.available}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 text-nexus-textSecondary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-nexus-textSecondary">
                    <Package size={48} className="mx-auto text-nexus-textSecondary dark:text-nexus-muted mb-3" />
                    <p className="text-base font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexus-card rounded-2xl shadow-2xl w-full max-w-md border border-nexus-border"
            >
              <div className="flex items-center justify-between p-5 border-b border-nexus-border">
                <div>
                  <h2 className="font-bold text-nexus-heading text-lg">Adjust Stock Quantity</h2>
                  <p className="text-xs text-nexus-textSecondary mt-0.5">
                    {selectedProduct ? `Product: ${selectedProduct.title}` : 'Select a product to adjust'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAdjustModalOpen(false)} 
                  className="p-2 rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-textSecondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitAdjust} className="p-5 space-y-4">
                {!selectedProduct && (
                  <div>
                    <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Product</label>
                    <select
                      onChange={(e) => handleSelectProductInAdjust(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                    >
                      <option value="">-- Choose Product --</option>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (Current: {p.stock})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">New Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    required
                    placeholder="Enter new quantity"
                    className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                  />
                  {selectedProduct && (
                    <span className="text-[11px] text-nexus-textSecondary mt-1 block">
                      Current Quantity: {selectedProduct.quantity} (Difference: {Number(adjustQty || 0) - selectedProduct.quantity})
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Adjustment Reason</label>
                  <textarea
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    required
                    rows="3"
                    className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 border border-nexus-border rounded-xl text-sm text-nexus-heading font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Save Adjustments'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexus-card rounded-2xl shadow-2xl w-full max-w-lg border border-nexus-border"
            >
              <div className="flex items-center justify-between p-5 border-b border-nexus-border">
                <div>
                  <h2 className="font-bold text-nexus-heading text-lg">Edit Product Details</h2>
                  <p className="text-xs text-nexus-textSecondary mt-0.5">Modify information and baseline stock metrics</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="p-2 rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-textSecondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Product Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">SKU ID</label>
                    <input
                      type="text"
                      value={editSku}
                      onChange={(e) => setEditSku(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Stock Level (Total)</label>
                    <input
                      type="number"
                      min="0"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nexus-muted uppercase mb-1.5">Cost Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editCostPrice}
                      onChange={(e) => setEditCostPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-nexus-border rounded-xl text-sm text-nexus-heading font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryProductsPage;
