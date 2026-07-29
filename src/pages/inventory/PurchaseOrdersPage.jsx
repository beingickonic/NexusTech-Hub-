import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Eye, CheckCircle2, XCircle, Clock, Archive, FileText, ShoppingCart, Truck, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();
  if (norm === 'received') return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/20"><CheckCircle2 className="w-3 h-3 inline mr-1" />Received</span>;
  if (norm === 'approved') return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/20"><CheckCircle2 className="w-3 h-3 inline mr-1" />Approved</span>;
  if (norm === 'cancelled' || norm === 'rejected') return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/20"><XCircle className="w-3 h-3 inline mr-1" />{status}</span>;
  if (norm === 'draft') return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-500/20"><FileText className="w-3 h-3 inline mr-1" />Draft</span>;
  if (norm === 'in transit') return <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs border border-purple-500/20"><Truck className="w-3 h-3 inline mr-1" />In Transit</span>;
  return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-500/20"><Clock className="w-3 h-3 inline mr-1" />Pending</span>;
};

const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Create state
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', supplier_id: '', warehouse_id: '', quantity: 1, unit_cost: 0, expected_delivery: '', notes: '' });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      setIsAdmin(profile?.role === 'admin' || profile?.role === 'inventory'); // Granting inventory officer approval rights for testing, ideally only admin. Let's allow admin for approval, but inventory officer can create. We'll set isAdmin to true if admin or finance. For simplicity, allow inventory to approve if needed or check strict admin. The prompt says "Admin can approve/reject".
      setIsAdmin(profile?.role === 'admin'); 
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [poRes, prodRes, supRes, whRes] = await Promise.all([
      inventoryService.getPurchaseRequests({ limit: 50 }),
      inventoryService.getProducts(),
      inventoryService.getSuppliers({ limit: 100 }),
      inventoryService.getWarehouses()
    ]);
    if (poRes.success) setOrders(poRes.data);
    if (prodRes.success) setProducts(prodRes.data);
    if (supRes.success) setSuppliers(supRes.data);
    if (whRes.success) setWarehouses(whRes.data);
    setLoading(false);
  };

  const handleCreate = async (submitType) => {
    try {
      const payload = {
        ...formData,
        status: submitType === 'draft' ? 'Draft' : 'Pending',
        total_cost: Number(formData.quantity) * Number(formData.unit_cost),
        requested_by: currentUser?.id
      };
      const { success, error } = await inventoryService.createPurchaseRequest(payload);
      if (success) {
        setShowCreateModal(false);
        setFormData({ product_id: '', supplier_id: '', warehouse_id: '', quantity: 1, unit_cost: 0, expected_delivery: '', notes: '' });
        fetchData();
      } else {
        alert(error?.message || 'Failed to create PO');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      const extra = (newStatus === 'Approved' || newStatus === 'Cancelled') ? { approved_by: currentUser?.id } : {};
      await inventoryService.updatePurchaseRequestStatus(id, newStatus, extra);
      fetchData();
      setSelectedOrder(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReceiveGoods = async (order) => {
    if (!confirm('Confirm goods received? This will update inventory.')) return;
    try {
      await inventoryService.receiveGoods(order.id, order.warehouse_id, order.quantity, currentUser?.id);
      fetchData();
      setSelectedOrder(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!confirm('Delete this draft?')) return;
    try {
      await inventoryService.deletePurchaseRequest(id);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchQuery) ||
    (o.products?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.suppliers?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-gray-400 text-sm">Manage procurement and stock requests</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-nexus-blue hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create PO
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by PO number, product, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-nexus-dark/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-nexus-blue"
          />
        </div>
      </div>

      <div className="bg-nexus-dark/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-gray-400 font-medium">PO Number</th>
                <th className="p-4 text-gray-400 font-medium">Date</th>
                <th className="p-4 text-gray-400 font-medium">Product</th>
                <th className="p-4 text-gray-400 font-medium">Supplier</th>
                <th className="p-4 text-gray-400 font-medium">Qty</th>
                <th className="p-4 text-gray-400 font-medium">Status</th>
                <th className="p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading purchase orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No purchase orders found</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm text-nexus-blue">PO-{String(order.id).padStart(5, '0')}</td>
                    <td className="p-4 text-gray-300">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300">{order.products?.title || 'Unknown'}</td>
                    <td className="p-4 text-gray-300">{order.suppliers?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-300">{order.quantity}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'Draft' && (
                          <button onClick={() => handleDeleteDraft(order.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-nexus-dark border border-white/10 rounded-xl w-full max-w-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create Purchase Order</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Product</label>
                    <select required value={formData.product_id} onChange={e => {
                      const prod = products.find(p => p.id == e.target.value);
                      setFormData({...formData, product_id: e.target.value, unit_cost: prod ? prod.price * 0.7 : 0}); // mock cost as 70% of price
                    }} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                      <option value="">Select Product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Supplier</label>
                    <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Warehouse</label>
                    <select required value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                      <option value="">Select Warehouse...</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Expected Delivery</label>
                    <input type="date" value={formData.expected_delivery} onChange={e => setFormData({...formData, expected_delivery: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                    <input type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Unit Cost (KES)</label>
                    <input type="number" min="0" value={formData.unit_cost} onChange={e => setFormData({...formData, unit_cost: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white h-24" placeholder="Any special instructions..."></textarea>
                </div>
                <div className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="text-xl font-bold text-white">KES {(Number(formData.quantity) * Number(formData.unit_cost)).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => handleCreate('draft')} disabled={!formData.product_id || !formData.supplier_id || !formData.warehouse_id} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">Save as Draft</button>
                <button onClick={() => handleCreate('pending')} disabled={!formData.product_id || !formData.supplier_id || !formData.warehouse_id} className="px-4 py-2 bg-nexus-blue hover:bg-blue-600 text-white rounded-lg transition-colors">Submit PO</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-nexus-dark border border-white/10 rounded-xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">PO-{String(selectedOrder.id).padStart(5, '0')} Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">Product</span>
                    <span className="text-gray-300">{selectedOrder.products?.title}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Supplier</span>
                    <span className="text-gray-300">{selectedOrder.suppliers?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Quantity</span>
                    <span className="text-gray-300">{selectedOrder.quantity}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Total Cost</span>
                    <span className="text-gray-300">KES {Number(selectedOrder.total_cost || (selectedOrder.quantity * selectedOrder.unit_cost)).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Date Created</span>
                    <span className="text-gray-300">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Expected Delivery</span>
                    <span className="text-gray-300">{selectedOrder.expected_delivery ? new Date(selectedOrder.expected_delivery).toLocaleDateString() : 'TBD'}</span>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Notes</span>
                    <div className="p-3 bg-white/5 rounded-lg text-sm text-gray-300">{selectedOrder.notes}</div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/10 flex flex-wrap justify-end gap-3">
                {selectedOrder.status === 'Draft' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Pending')} className="px-4 py-2 bg-nexus-blue text-white rounded-lg hover:bg-blue-600 transition-colors">Submit to Pending</button>
                )}
                
                {selectedOrder.status === 'Pending' && isAdmin && (
                  <>
                    <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Rejected')} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">Reject</button>
                    <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Approved')} className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">Approve</button>
                  </>
                )}
                
                {selectedOrder.status === 'Approved' && (
                  <button onClick={() => handleReceiveGoods(selectedOrder)} className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors">Receive Goods</button>
                )}

                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOrdersPage;
