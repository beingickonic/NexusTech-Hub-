import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../services/supabaseClient';
import { Plus, Search, Edit2, Trash2, Eye, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const EDITABLE_ROLES = ['Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer'];

const emptyForm = () => ({
  order_id: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  subtotal: '',
  shipping_fee: '0',
  tax: '0',
  payment_method: '',
  payment_status: 'UNPAID',
  due_date: '',
});

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [orderOptions, setOrderOptions] = useState([]);

  const canEdit = EDITABLE_ROLES.includes(user?.role);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await financeService.getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderOptions = async () => {
    try {
      const [{ data: orders }, { data: existing }] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, total_amount, payment_status, payment_method, status, created_at, profiles:user_id(full_name, phone)')
          .in('status', ['Pending Finance Approval', 'Finance Approved', 'Paid', 'Reserved'])
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('invoices').select('order_id'),
      ]);
      const taken = new Set((existing || []).map(i => i.order_id));
      setOrderOptions((orders || []).filter(o => !taken.has(o.id)));
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const openCreate = async () => {
    setError('');
    setEditing(null);
    setForm(emptyForm());
    await loadOrderOptions();
    setModalOpen(true);
  };

  const openEdit = (invoice) => {
    setError('');
    setEditing(invoice);
    setForm({
      order_id: invoice.order_id || '',
      customer_name: invoice.customer_name || '',
      customer_email: invoice.customer_email || '',
      customer_phone: invoice.customer_phone || '',
      subtotal: invoice.subtotal ?? invoice.amount ?? '',
      shipping_fee: invoice.shipping_fee ?? '0',
      tax: invoice.tax ?? '0',
      payment_method: invoice.payment_method || '',
      payment_status: invoice.payment_status || 'UNPAID',
      due_date: invoice.due_date ? String(invoice.due_date).slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleOrderSelect = (orderId) => {
    const order = orderOptions.find(o => o.id === orderId);
    if (!order) return;
    const customer = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    setForm(prev => ({
      ...prev,
      order_id: orderId,
      customer_name: customer?.full_name || order.shipping_name || '',
      customer_phone: customer?.phone || order.shipping_phone || '',
      subtotal: order.total_amount ?? '',
      payment_method: order.payment_method || '',
    }));
  };

  const getTotal = () => {
    const sub = Number(form.subtotal) || 0;
    const ship = Number(form.shipping_fee) || 0;
    const tax = Number(form.tax) || 0;
    return sub + ship + tax;
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const total = getTotal();
      const order = form.order_id ? orderOptions.find(o => o.id === form.order_id) : null;
      const payload = {
        customer_name: form.customer_name.trim() || null,
        customer_email: form.customer_email.trim() || null,
        customer_phone: form.customer_phone.trim() || null,
        subtotal: Number(form.subtotal) || 0,
        shipping_fee: Number(form.shipping_fee) || 0,
        tax: Number(form.tax) || 0,
        total_amount: total,
        balance: form.payment_status === 'PAID' ? 0 : total,
        payment_status: form.payment_status,
        payment_method: form.payment_method || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };

      if (editing) {
        const res = await financeService.updateInvoice(editing.id, payload);
        if (!res.success) { setError(res.message); return; }
      } else {
        const insertPayload = {
          ...payload,
          order_id: form.order_id || null,
          user_id: order?.user_id || null,
          order_date: order?.created_at || null,
        };
        const res = await financeService.createInvoice(insertPayload);
        if (!res.success) { setError(res.message); return; }
      }

      setModalOpen(false);
      await loadInvoices();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await financeService.deleteInvoice(deleteTarget.id);
    setDeleting(false);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setDeleteTarget(null);
    await loadInvoices();
  };

  const filteredInvoices = invoices.filter(inv =>
    !search ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.toLowerCase().includes(search.toLowerCase()) ||
    inv.email?.toLowerCase().includes(search.toLowerCase())
  );

  const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading">Invoices</h1>
          <p className="text-nexus-textSecondary">Manage customer invoices</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-nexus-error hover:bg-nexus-error text-white px-4 py-2 rounded-xl flex items-center transition-colors"
          >
            <Plus size={18} className="mr-2" /> Create Invoice
          </button>
        )}
      </div>

      <div className="bg-nexus-card rounded-2xl shadow-sm border border-nexus-border overflow-hidden">
        <div className="p-4 border-b border-nexus-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={20} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-nexus-border bg-nexus-surface text-nexus-heading focus:ring-2 focus:ring-nexus-error"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-nexus-surface/50 text-nexus-muted text-sm">
              <tr>
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">Loading...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-nexus-textSecondary">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">
                    <td className="p-4 font-medium text-nexus-heading">{invoice.invoice_number}</td>
                    <td className="p-4 text-nexus-muted">
                      <div>{invoice.customer || 'N/A'}</div>
                      <div className="text-xs text-nexus-textSecondary">{invoice.phone || invoice.email}</div>
                    </td>
                    <td className="p-4 text-nexus-muted">KSh {Number(invoice.amount).toLocaleString()}</td>
                    <td className="p-4 text-nexus-muted">KSh {Number(invoice.balance).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' :
                        invoice.status === 'Overdue' ? 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error' :
                        'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-nexus-muted">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg" title="View"><Eye size={16} /></button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => openEdit(invoice)}
                            className="p-1.5 text-nexus-info hover:bg-nexus-info/10 dark:hover:bg-nexus-info/10 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(invoice)}
                            className="p-1.5 text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-nexus-card shadow-2xl z-50 flex flex-col border-l border-nexus-border">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <div>
                <h3 className="text-xl font-bold text-nexus-heading">
                  {editing ? 'Edit Invoice' : 'Create Invoice'}
                </h3>
                {editing && (
                  <p className="text-sm text-nexus-textSecondary mt-1">{editing.invoice_number}</p>
                )}
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-nexus-textSecondary hover:text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-full transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 text-nexus-error bg-nexus-error/5 border border-nexus-error/20 rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Order (optional)</label>
                  <select
                    value={form.order_id}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50"
                  >
                    <option value="">— Standalone invoice —</option>
                    {orderOptions.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.order_number || `#${o.id}`} · KSh {Number(o.total_amount).toLocaleString()} · {o.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Customer Name</label>
                  <input value={form.customer_name} onChange={setField('customer_name')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Customer Phone</label>
                  <input value={form.customer_phone} onChange={setField('customer_phone')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Customer Email</label>
                  <input value={form.customer_email} onChange={setField('customer_email')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Subtotal</label>
                  <input type="number" value={form.subtotal} onChange={setField('subtotal')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexus-heading mb-1.5">Shipping</label>
                    <input type="number" value={form.shipping_fee} onChange={setField('shipping_fee')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexus-heading mb-1.5">Tax</label>
                    <input type="number" value={form.tax} onChange={setField('tax')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Payment Status</label>
                  <select value={form.payment_status} onChange={setField('payment_status')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50">
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Payment Method</label>
                  <input value={form.payment_method} onChange={setField('payment_method')} placeholder="e.g. M-Pesa" className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-heading mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={setField('due_date')} className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-3 py-2.5 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-error/50" />
                </div>
              </div>

              <div className="bg-nexus-surface rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-nexus-textSecondary">Total</span>
                <span className="text-xl font-bold text-nexus-heading">KSh {getTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-nexus-border bg-nexus-surface/50 dark:bg-nexus-surface/50 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 bg-nexus-surface hover:bg-nexus-hover text-nexus-heading rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-nexus-error hover:bg-nexus-error text-white rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {editing ? 'Save Changes' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-nexus-card rounded-2xl shadow-2xl z-50 p-6 border border-nexus-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-nexus-error/10 text-nexus-error rounded-xl"><Trash2 size={20} /></div>
              <div>
                <h3 className="font-bold text-nexus-heading">Delete Invoice</h3>
                <p className="text-sm text-nexus-textSecondary">{deleteTarget.invoice_number}</p>
              </div>
            </div>
            <p className="text-sm text-nexus-textSecondary mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-nexus-surface hover:bg-nexus-hover text-nexus-heading rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-nexus-error hover:bg-nexus-error text-white rounded-xl text-sm font-medium transition-colors"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoicesPage;
