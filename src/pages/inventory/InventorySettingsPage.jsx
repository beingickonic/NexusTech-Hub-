import { useState } from 'react';
import { Settings, Bell, Shield, Database, Globe, Moon, Sun, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-nexus-border">
      <div className="p-2 bg-primary/10 rounded-xl">
        <Icon size={18} className="text-primary" />
      </div>
      <h2 className="font-bold text-nexus-heading text-sm">{title}</h2>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const Toggle = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-nexus-heading">{label}</p>
      {description && <p className="text-xs text-nexus-textSecondary mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-primary' : 'bg-nexus-surface dark:bg-nexus-card'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const InventorySettingsPage = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    lowStock: true,
    outOfStock: true,
    newPurchaseOrder: true,
    goodsReceived: false,
    stockTransfer: true,
  });

  const [display, setDisplay] = useState({
    showStockValue: true,
    showHealthScore: true,
    compactView: false,
    autoRefresh: true,
  });

  const [thresholds, setThresholds] = useState({
    lowStockDefault: 10,
    criticalStockDefault: 5,
    overstockMultiplier: 3,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Inventory Settings</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Configure your warehouse portal preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-nexus-primary-hover text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Account Info */}
      <Section title="Account Information" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="px-4 py-3 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-sm text-nexus-heading border border-nexus-border">
              {user?.full_name || 'Warehouse Staff'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">Email</label>
            <div className="px-4 py-3 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-sm text-nexus-heading border border-nexus-border">
              {user?.email || '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">Role</label>
            <div className="px-4 py-3 bg-primary/10 rounded-xl text-sm text-primary font-semibold border border-primary/20">
              {user?.role?.replace('_', ' ') || 'Warehouse Staff'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">Department</label>
            <div className="px-4 py-3 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-sm text-nexus-heading border border-nexus-border">
              {user?.department || 'Warehouse / Inventory'}
            </div>
          </div>
        </div>
      </Section>

      {/* Notification Settings */}
      <Section title="Notification Preferences" icon={Bell}>
        <Toggle
          label="Low Stock Alerts"
          description="Get notified when items fall below minimum threshold"
          value={notifications.lowStock}
          onChange={v => setNotifications(n => ({ ...n, lowStock: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Out of Stock Alerts"
          description="Immediate notification when an item reaches zero"
          value={notifications.outOfStock}
          onChange={v => setNotifications(n => ({ ...n, outOfStock: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="New Purchase Orders"
          description="Notify when a new PO is created or approved"
          value={notifications.newPurchaseOrder}
          onChange={v => setNotifications(n => ({ ...n, newPurchaseOrder: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Goods Received Notes"
          description="Notify when a GRN is submitted"
          value={notifications.goodsReceived}
          onChange={v => setNotifications(n => ({ ...n, goodsReceived: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Stock Transfers"
          description="Notify on inter-warehouse transfers"
          value={notifications.stockTransfer}
          onChange={v => setNotifications(n => ({ ...n, stockTransfer: v }))}
        />
      </Section>

      {/* Display Settings */}
      <Section title="Display Preferences" icon={Globe}>
        <Toggle
          label="Show Stock Value"
          description="Display total inventory value on dashboard"
          value={display.showStockValue}
          onChange={v => setDisplay(d => ({ ...d, showStockValue: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Show Health Score"
          description="Display overall inventory health percentage"
          value={display.showHealthScore}
          onChange={v => setDisplay(d => ({ ...d, showHealthScore: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Compact View"
          description="Use denser table rows for more data on screen"
          value={display.compactView}
          onChange={v => setDisplay(d => ({ ...d, compactView: v }))}
        />
        <div className="border-t border-nexus-border" />
        <Toggle
          label="Auto-Refresh Dashboard"
          description="Automatically refresh data every 60 seconds"
          value={display.autoRefresh}
          onChange={v => setDisplay(d => ({ ...d, autoRefresh: v }))}
        />
      </Section>

      {/* Stock Thresholds */}
      <Section title="Stock Thresholds" icon={Database}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
              Low Stock Default (units)
            </label>
            <input
              type="number"
              min="1"
              value={thresholds.lowStockDefault}
              onChange={e => setThresholds(t => ({ ...t, lowStockDefault: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl text-sm text-nexus-heading focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
              Critical Stock (units)
            </label>
            <input
              type="number"
              min="1"
              value={thresholds.criticalStockDefault}
              onChange={e => setThresholds(t => ({ ...t, criticalStockDefault: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl text-sm text-nexus-heading focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider mb-1.5">
              Overstock Multiplier (×)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={thresholds.overstockMultiplier}
              onChange={e => setThresholds(t => ({ ...t, overstockMultiplier: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl text-sm text-nexus-heading focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <p className="text-xs text-nexus-textSecondary mt-2">
          Items with stock below <strong>Low Stock</strong> threshold trigger low-stock alerts. Items above <strong>Overstock Multiplier × reorder level</strong> are flagged as overstocked.
        </p>
      </Section>
    </div>
  );
};

export default InventorySettingsPage;
