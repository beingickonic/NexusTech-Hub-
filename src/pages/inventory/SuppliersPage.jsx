import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Building2, MapPin, X } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();
  if (norm === 'active') return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/20">Active</span>;
  if (norm === 'suspended') return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs border border-orange-500/20">Suspended</span>;
  return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/20">Inactive</span>;
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', email: '', company: '', address: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    const { success, data } = await inventoryService.getSuppliers({ limit: 100 });
    if (success) setSuppliers(data);
    setLoading(false);
  };

  const handleOpenModal = (mode, supplier = null) => {
    setModalMode(mode);
    if (mode === 'edit' && supplier) {
      setFormData(supplier);
      setEditingId(supplier.id);
    } else {
      setFormData({ name: '', contact_person: '', phone: '', email: '', company: '', address: '', status: 'active' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await inventoryService.createSupplier(formData);
      } else {
        await inventoryService.updateSupplier(editingId, formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.message || 'Error saving supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier? This may fail if there are linked purchase orders.')) return;
    try {
      await inventoryService.deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      alert('Could not delete supplier. It might be referenced in other records. Consider changing status to inactive instead.');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-gray-400 text-sm">Manage procurement vendors and contacts</p>
        </div>
        <button onClick={() => handleOpenModal('add')} className="px-4 py-2 bg-nexus-blue hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Supplier
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-nexus-dark/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-nexus-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-400">Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400">No suppliers found</div>
        ) : (
          filteredSuppliers.map(supplier => (
            <motion.div key={supplier.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-nexus-dark border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{supplier.name}</h3>
                  {supplier.company && <div className="text-sm text-nexus-blue flex items-center mt-1"><Building2 className="w-3 h-3 mr-1" />{supplier.company}</div>}
                </div>
                <StatusBadge status={supplier.status} />
              </div>

              <div className="space-y-2 text-sm text-gray-400 mb-6">
                {supplier.contact_person && (
                  <div className="flex items-center"><div className="w-5 text-gray-500">👤</div>{supplier.contact_person}</div>
                )}
                {supplier.email && (
                  <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-500" />{supplier.email}</div>
                )}
                {supplier.phone && (
                  <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-500" />{supplier.phone}</div>
                )}
                {supplier.address && (
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-500" />{supplier.address}</div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                <button onClick={() => handleOpenModal('edit', supplier)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-nexus-dark border border-white/10 rounded-xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{modalMode === 'add' ? 'Add Supplier' : 'Edit Supplier'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Supplier Name *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Contact Person</label>
                      <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Company</label>
                      <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Phone</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Address</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-nexus-blue hover:bg-blue-600 text-white rounded-lg transition-colors">Save Supplier</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersPage;
