import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { productService } from '../services/productService';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getFeaturedProducts(4);
        if (res.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (isLoading || products.length === 0) {
    return null; // hide section if no products or loading
  }

  return (
    <section className="py-20 bg-white dark:bg-nexus-bg/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-nexus-heading mb-4">Featured Products</h2>
          <p className="text-nexus-textSecondary dark:text-nexus-muted max-w-2xl mx-auto">
            Handpicked premium gadgets that blend cutting-edge technology with stunning design aesthetics.
          </p>
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
    </section>
  );
};

export default FeaturedProducts;
