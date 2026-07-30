import React, { useState } from 'react';
import { Camera, Scan, PenLine, Package } from 'lucide-react';

const DeliveryStatusPage = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('delivered');
  const [notes, setNotes] = useState('');

  const statuses = [
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'customer_unavailable', label: 'Customer Unavailable' },
    { value: 'wrong_address', label: 'Wrong Address' },
    { value: 'returned', label: 'Returned' },
  ];

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Status for Order ${orderId} updated to ${status}. Notes: ${notes}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-nexus-warninglue-500/20 flex items-center justify-center">
          <PenLine className="text-nexus-warninglue-500" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Status</h1>
          <p className="text-sm text-nexus-textSecondary">Update progress in real time.</p>
        </div>
      </div>

      <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-6 shadow-lg mb-6">
        <button className="w-full mb-6 bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center gap-2">
          <Scan size={32} />
          <span>Scan Barcode</span>
        </button>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-nexus-textSecondary ml-1">Order Number</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-nexus-bg border border-nexus-border/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="e.g. ORD-1234"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-nexus-textSecondary ml-1">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-nexus-bg border border-nexus-border/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-nexus-textSecondary ml-1">Delivery Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-nexus-bg border border-nexus-border/50 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="e.g. Left at front door"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" className="flex-1 bg-nexus-bg border border-nexus-border hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
              <Camera size={20} className="text-nexus-textSecondary" />
              Add Photo
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-br from-nexus-primary to-nexus-warning hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-nexus-primary/20">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryStatusPage;
