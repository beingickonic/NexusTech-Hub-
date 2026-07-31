import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Box, Edit2, Trash2, X, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const STATUS_STYLES = {
  pending: 'bg-nexus-gold/15 text-nexus-gold dark:bg-nexus-gold/20',
  approved: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20',
  rejected: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20',
};

const EMPTY_FORM = {
  title: '',
  brand: '',
  sku: '',
  category_id: '',
  price: '',
  stock: '10',
  short_desc: '',
};

const SupplierProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('supplier_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const loadCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name');
      if (!error) setCategories(data || []);
    };
    loadCategories();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title || '',
      brand: product.brand || '',
      sku: product.sku || '',
      category_id: product.category_id != null ? String(product.category_id) : '',
      price: product.price != null ? String(product.price) : '',
      stock: product.stock != null ? String(product.stock) : '10',
      short_desc: product.short_desc || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Please enter a valid unit price');
      return;
    }
    if (!form.category_id) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim() || null,
        sku: form.sku.trim() || null,
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock: Math.max(0, Number(form.stock) || 0),
        short_desc: form.short_desc.trim() || null,
        availability: false,
        approval_status: 'pending',
      };

      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id)
          .eq('approval_status', 'pending');

        if (error) throw error;
        toast.success('Product updated — pending inventory review');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...payload, supplier_id: authUser.id });

        if (error) throw error;
        toast.success('Product submitted for inventory review');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('approval_status', 'pending');

      if (error) throw error;
      toast.success('Product removed');
      fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter(p => {
    const q = searchTerm.toLowerCase();
    return !q ||
      p.title?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.categories?.name?.toLowerCase().includes(q);
  });

  const pendingCount = products.filter(p => p.approval_status === 'pending').length;

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">My Products</h1>
          <p className="text-sm text-nexus-textSecondary">
            Add products you can supply — the inventory manager reviews and stocks them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-nexus-gold/15 text-nexus-gold">
              {pendingCount} awaiting review
            </span>
          )}
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-white dark:bg-nexus-bg border border-nexus-border text-nexus-textSecondary hover:text-nexus-heading transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <span className="text-sm text-nexus-textSecondary">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-nexus-textSecondary">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No products yet</p>
            <p className="text-sm mt-1">Add a product you can supply to get it into the inventory.</p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-nexus-surface dark:bg-nexus-hover text-nexus-textSecondary">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Unit Price</th>
                  <th className="px-6 py-4 font-medium">Supply Qty</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-nexus-surface dark:bg-nexus-hover flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Box size={20} className="text-nexus-textSecondary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-nexus-heading line-clamp-1">{product.title}</p>
                          <p className="text-xs text-nexus-textSecondary">
                            {[product.brand, product.sku].filter(Boolean).join(' • ') || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">{product.categories?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-nexus-heading">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-nexus-muted">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[product.approval_status] || STATUS_STYLES.pending}`}>
                        {product.approval_status === 'approved' ? 'In Stock' : product.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nexus-textSecondary text-xs">{formatDate(product.created_at)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {product.approval_status === 'pending' ? (
                        <>
                          <button
                            onClick={() => openEdit(product)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-nexus-primary/10 text-nexus-primary hover:bg-nexus-primary/20 transition-colors"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-nexus-error/10 text-nexus-error hover:bg-nexus-error/20 transition-colors ml-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-nexus-textSecondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-nexus-card w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-border">
                <h3 className="text-lg font-semibold text-nexus-heading">
                  {editing ? 'Edit Product' : 'Add Product to Inventory'}
                </h3>
                <button onClick={() => !submitting && setShowModal(false)} className="text-nexus-textSecondary hover:text-nexus-heading">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="p-3 rounded-xl bg-info/10 text-info text-xs flex items-start gap-2">
                  <Package size={16} className="shrink-0 mt-0.5" />
                  <span>This product goes to the inventory manager for review before it can be stocked and sold.</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-nexus-textSecondary">Product name <span className="text-nexus-error">*</span></label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. HP LaserJet Pro M404dn"
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-nexus-textSecondary">Brand</label>
                    <input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="e.g. HP"
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-nexus-textSecondary">SKU</label>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="e.g. HP-LJ-M404DN"
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-nexus-textSecondary">Category <span className="text-nexus-error">*</span></label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-nexus-textSecondary">Unit price (KES) <span className="text-nexus-error">*</span></label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-nexus-textSecondary">Quantity supplied</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="10"
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-nexus-textSecondary">Short description</label>
                  <textarea
                    value={form.short_desc}
                    onChange={(e) => setForm({ ...form, short_desc: e.target.value })}
                    rows={2}
                    placeholder="Key specs or notes for the inventory team..."
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-nexus-border flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-nexus-surface text-nexus-text border border-nexus-border hover:bg-nexus-hover disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-nexus-primary hover:bg-nexus-primary-hover text-white disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Submit for Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierProductsPage;
