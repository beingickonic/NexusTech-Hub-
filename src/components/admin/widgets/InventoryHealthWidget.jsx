import React from 'react';

const InventoryHealthWidget = ({ products = [] }) => {
  const healthy = products.filter(p => p.stock > 10).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const total = products.length || 1; // prevent div by zero

  const healthyPct = Math.round((healthy / total) * 100);
  const lowStockPct = Math.round((lowStock / total) * 100);
  const outOfStockPct = Math.round((outOfStock / total) * 100);

  return (
    <div className="bg-nexus-card backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-nexus-border shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-nexus-heading mb-4 md:mb-6">Inventory Health</h3>
      
      <div className="space-y-4 md:space-y-5">
        {/* Healthy */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-nexus-muted font-medium">Healthy Products</span>
            <span className="text-nexus-heading font-bold">{healthy}</span>
          </div>
          <div className="h-2.5 w-full bg-nexus-surface rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${healthyPct}%` }}></div>
          </div>
        </div>

        {/* Low Stock */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-nexus-muted font-medium">Low Stock</span>
            <span className="text-warning font-bold">{lowStock}</span>
          </div>
          <div className="h-2.5 w-full bg-nexus-surface rounded-full overflow-hidden">
            <div className="h-full bg-warning rounded-full" style={{ width: `${lowStockPct}%` }}></div>
          </div>
        </div>

        {/* Out of Stock */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-nexus-muted font-medium">Out of Stock</span>
            <span className="text-danger font-bold">{outOfStock}</span>
          </div>
          <div className="h-2.5 w-full bg-nexus-surface rounded-full overflow-hidden">
            <div className="h-full bg-danger rounded-full" style={{ width: `${outOfStockPct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHealthWidget;
