import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import categoryService from '../../services/categoryService';
import { productService } from '../../services/productService';

const ProductListingPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbCategories, setDbCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await categoryService.getCategories();
      if (res.success) {
        setDbCategories(res.data.categories);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const filters = {};
        if (selectedCategory !== 'All') {
          const cat = dbCategories.find(c => c.name === selectedCategory);
          if (cat) filters.category_id = cat.id;
        }
        if (searchQuery) filters.search = searchQuery;
        
        const res = await productService.getProducts(filters);
        if (res.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small debounce for search
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  const categoriesList = ['All', ...dbCategories.map(c => c.name)];

  return (
    <div className="py-12 bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Shop All Products</h1>
          <p className="text-slate-500 dark:text-gray-400">Discover our premium collection of tech gear.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 relative z-20">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-full sm:w-auto lg:hidden flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors"
          >
            <Filter size={18} /> Filters
          </button>

          <div className="relative w-full sm:max-w-md">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-gray-400">Sort by:</span>
            <select className="bg-transparent border-none text-slate-900 dark:text-white outline-none cursor-pointer font-medium focus:ring-0">
              <option className="dark:bg-dark-surface">Featured</option>
              <option className="dark:bg-dark-surface">Price: Low to High</option>
              <option className="dark:bg-dark-surface">Price: High to Low</option>
              <option className="dark:bg-dark-surface">Newest</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 rounded-2xl p-6 sticky top-28 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Categories</h3>
              <ul className="flex flex-col gap-3">
                {categoriesList.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm transition-colors text-left w-full hover:text-primary ${selectedCategory === cat ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 mt-10">Price Range</h3>
              <input type="range" className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mt-2">
                <span>Ksh 0</span>
                <span>Ksh 50,000+</span>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
               <div className="py-20 text-center text-slate-500 dark:text-gray-400">
                 <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                 <p>Loading products...</p>
               </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.length > 0 ? (
                    products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="h-full"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center text-slate-500 dark:text-gray-400 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                      <Filter size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg">No products found matching your criteria.</p>
                    </div>
                  )}
                </div>

                {/* Pagination Placeholder */}
                {products.length > 0 && (
                  <div className="flex justify-center mt-12 gap-2">
                    {[1].map(page => (
                      <button key={page} className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${page === 1 ? 'bg-primary text-white shadow-glow' : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10'}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-white dark:bg-dark-surface z-[70] p-6 overflow-y-auto shadow-2xl border-r border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Categories</h4>
              <ul className="flex flex-col gap-3 mb-8">
                {categoriesList.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                      className={`text-sm w-full text-left transition-colors ${selectedCategory === cat ? 'text-primary font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
              
              <h4 className="font-bold mb-4 text-slate-900 dark:text-white mt-8">Price Range</h4>
              <input type="range" className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mt-2">
                <span>Ksh 0</span>
                <span>Ksh 50,000+</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListingPage;
