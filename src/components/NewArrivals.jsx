import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/productService';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await productService.getNewArrivals(4);
        if (res.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch new arrivals", err);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <section className="py-20 bg-[#F4F4F8] dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* New Arrivals Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative rounded-3xl overflow-hidden bg-white dark:bg-dark-surface p-8 sm:p-12 flex flex-col justify-center min-h-[400px] border border-slate-200 dark:border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg"
          >
            <div className="relative z-10 w-full sm:w-1/2">
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-dark-bg text-slate-900 dark:text-white text-xs font-bold rounded-full mb-4 shadow-sm">
                NEW ARRIVALS
              </span>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Next-Gen <br/> Gaming Gear
              </h3>
              <p className="text-slate-500 dark:text-gray-400 mb-6 line-clamp-2">
                Elevate your play with the latest high-performance accessories.
              </p>
              <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                Shop Collection <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="absolute right-[-10%] bottom-[-10%] w-2/3 h-full z-0 flex items-end justify-end pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&q=80&w=600" 
                alt="Gaming Controller" 
                className="w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>

          {/* Best Sellers Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/5 p-8 sm:p-12 flex flex-col justify-center min-h-[400px] border border-slate-200 dark:border-transparent hover:border-primary/30 transition-all duration-300 shadow-lg"
          >
            <div className="relative z-10 w-full sm:w-1/2">
              <span className="inline-block px-3 py-1 bg-white dark:bg-dark-bg text-primary text-xs font-bold rounded-full mb-4 shadow-sm">
                BEST SELLERS
              </span>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Trending <br/> Audio
              </h3>
              <p className="text-slate-500 dark:text-gray-400 mb-6 line-clamp-2">
                Discover the headphones everyone is talking about.
              </p>
              <button className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:gap-4 transition-all hover:text-primary dark:hover:text-primary">
                Shop Audio <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="absolute right-[-10%] bottom-[5%] w-2/3 h-full z-0 flex items-center justify-end pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600" 
                alt="Premium Audio" 
                className="w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>
        </div>

        {/* Dynamic New Arrivals Grid */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Just Landed</h2>
              <button className="text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default NewArrivals;
