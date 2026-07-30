import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import categoryService from '../services/categoryService';

const getFallbackImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('laptop')) return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80';
  if (n.includes('smartphone') || n.includes('tablet')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80';
  if (n.includes('desktop') || n.includes('workstation')) return 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80';
  if (n.includes('network')) return 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&q=80';
  if (n.includes('accessori')) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';
  if (n.includes('software')) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80';
  if (n.includes('storage')) return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80';
  if (n.includes('printer') || n.includes('scanner')) return 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80';
  if (n.includes('gaming')) return 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&q=80';
  if (n.includes('monitor') || n.includes('display')) return 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=400&q=80';
  return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80';
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success) setCategories(res.data.categories);
    });
  }, []);

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-nexus-textSecondary dark:text-gray-400">
              Discover the tech that fits your lifestyle.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 text-primary font-medium hover:text-orange-600 transition-colors text-sm"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Responsive grid: 2 cols phone → 3 tablet → 6 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.08, 0.4), duration: 0.5 }}
              className="group cursor-pointer touch-card"
            >
              <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>
                <div className="relative w-full aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-dark-surface shadow-md dark:shadow-soft mb-2 sm:mb-4 border border-slate-200 dark:border-transparent transition-all duration-300 hover:border-primary hover:shadow-orange-200 dark:hover:border-primary/50 dark:hover:shadow-glow">
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/20 group-hover:bg-black/0 transition-colors duration-300 z-10" />
                  <img
                    src={cat.image || getFallbackImage(cat.name)}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-center font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to="/products"
            className="flex items-center gap-2 text-primary font-medium text-sm"
          >
            View All Categories <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
