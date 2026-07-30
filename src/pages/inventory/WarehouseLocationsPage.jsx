import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Package, Users, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

const WarehouseLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    manager_name: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true);
      try {
        const { success, data } = await inventoryService.getWarehouses();
        if (success) {
          const mapped = data.map((wh) => ({
            id: wh.id,
            name: wh.name,
            location: wh.location || 'Unknown Location',
            capacity: wh.capacity || 50000,
            current: wh.current_utilization || 0,
            manager: wh.manager_name || 'System Admin',
            status: wh.status?.toLowerCase() || 'active'
          }));
          setLocations(mapped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const openModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity,
        manager_name: warehouse.manager,
        status: warehouse.status
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        name: '',
        location: '',
        capacity: '',
        manager_name: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        capacity: Number(formData.capacity),
        manager_name: formData.manager_name,
        status: formData.status
      };

      if (editingWarehouse) {
        const { success, error } = await inventoryService.updateWarehouse(editingWarehouse.id, payload);
        if (success) {
          toast.success('Warehouse updated successfully');
          setLocations(prev => prev.map(w => w.id === editingWarehouse.id ? { ...w, ...payload, current: w.current, manager: payload.manager_name } : w));
          handleCloseModal();
        } else {
          toast.error(error || 'Failed to update warehouse');
        }
      } else {
        const { success, data, error } = await inventoryService.createWarehouse(payload);
        if (success) {
          toast.success('Warehouse created successfully');
          const newWh = {
            id: data.id,
            name: data.name,
            location: data.location,
            capacity: data.capacity,
            current: data.current_utilization || 0,
            manager: data.manager_name,
            status: data.status
          };
          setLocations(prev => [...prev, newWh]);
          handleCloseModal();
        } else {
          toast.error(error || 'Failed to create warehouse');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) return;
    try {
      const { success, error } = await inventoryService.deleteWarehouse(id);
      if (success) {
        toast.success('Warehouse deleted successfully');
        setLocations(prev => prev.filter(w => w.id !== id));
      } else {
        toast.error(error || 'Failed to delete warehouse');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Locations</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Manage multiple warehouses and capacity</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25"
        >
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm animate-pulse">
              <div className="h-6 w-32 bg-slate-100 dark:bg-white/5 rounded mb-4"></div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-white/5 rounded mb-6"></div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full mb-2"></div>
              <div className="h-4 w-24 bg-slate-100 dark:bg-white/5 rounded"></div>
            </div>
          ))
        ) : locations.length > 0 ? (
          locations.map((loc) => (
            <motion.div 
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm flex flex-col group hover:border-primary/40 dark:hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">{loc.name}</h3>
                  <div className="flex items-center gap-1.5 text-nexus-textSecondary text-sm mt-1">
                    <MapPin size={14} /> {loc.location}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                  loc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {loc.status}
                </span>
              </div>
              
              <div className="mt-4 flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-nexus-textSecondary font-medium">Capacity Utilization</span>
                  <span className="text-slate-900 dark:text-white font-bold">{Math.round((loc.current / loc.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (loc.current / loc.capacity) > 0.85 ? 'bg-red-500' : 
                      (loc.current / loc.capacity) > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(loc.current / loc.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-nexus-textSecondary mt-2">
                  <span>{loc.current.toLocaleString()} used</span>
                  <span>{loc.capacity.toLocaleString()} total</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-nexus-textSecondary">
                  <Users size={16} /> {loc.manager}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openModal(loc)} className="text-sm font-semibold text-primary hover:text-orange-600 flex items-center gap-1">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(loc.id)} className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm flex flex-col items-center justify-center">
            <Package size={48} className="text-nexus-textSecondary dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Warehouses Found</h3>
            <p className="text-nexus-textSecondary text-sm max-w-sm mx-auto">You haven't added any warehouse locations yet. Click "Add Warehouse" to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-nexus-surface/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-nexus-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-nexus-textSecondary hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">
                      Warehouse Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. Main Distribution Center"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">
                      Location / Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. London, UK"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">
                        Max Capacity (Units) *
                      </label>
                      <input
                         type="number"
                         required
                         min="1"
                         value={formData.capacity}
                         onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                         className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                         placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-nexus-textSecondary mb-1">
                      Manager Name
                    </label>
                    <input
                      type="text"
                      value={formData.manager_name}
                      onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
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

export default WarehouseLocationsPage;
