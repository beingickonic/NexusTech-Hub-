import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit, Image as ImageIcon, Barcode, Package, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const InventoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Simulating a complex join across products, inventory, and categories
      // In a real app, this would be: 
      // const { data } = await supabase.from('products').select(`*, category:categories(*), inventory:inventory(*)`)
      
      setTimeout(() => {
        setProducts([
          {
            id: '1',
            title: 'Dell XPS 15',
            sku: 'LPT-DELL-XPS15',
            barcode: '8492019382',
            category: 'Laptops',
            price: 1499.99,
            cost_price: 1200.00,
            quantity: 45,
            reserved: 5,
            available: 40,
            image_url: null,
          },
          {
            id: '2',
            title: 'Samsung Galaxy S23 Ultra',
            sku: 'MOB-SAM-S23U',
            barcode: '8492019383',
            category: 'Smartphones',
            price: 1199.99,
            cost_price: 950.00,
            quantity: 120,
            reserved: 10,
            available: 110,
            image_url: null,
          },
          {
            id: '3',
            title: 'Herman Miller Aeron',
            sku: 'FURN-HM-AER',
            barcode: '8492019384',
            category: 'Office Furniture',
            price: 1250.00,
            cost_price: 800.00,
            quantity: 15,
            reserved: 2,
            available: 13,
            image_url: null,
          },
          {
            id: '4',
            title: 'Logitech MX Master 3S',
            sku: 'ACC-LOG-MX3S',
            barcode: '8492019385',
            category: 'Accessories',
            price: 99.99,
            cost_price: 60.00,
            quantity: 5,
            reserved: 0,
            available: 5,
            image_url: null,
          }
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage stock levels, SKUs, and barcodes</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Barcode size={18} /> Scan Barcode
          </button>
          <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20">
            <ArrowRightLeft size={18} /> Adjust Stock
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, SKU, or Barcode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identifiers</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Stock Levels</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="h-10 w-48 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-32 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-24 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-32 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse mx-auto"></div></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <ImageIcon className="text-slate-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{product.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase w-8">SKU:</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{product.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase w-8">UPC:</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{product.barcode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase w-10">Sell:</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase w-10">Cost:</span>
                          <span className="text-sm font-medium text-slate-500">${product.cost_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Total</p>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{product.quantity}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Rsrvd</p>
                          <span className="text-sm font-bold text-amber-500">{product.reserved}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">Avail</p>
                          <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                            product.available > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            product.available > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {product.available}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-base font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search filters.</p>
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

export default InventoryProductsPage;
