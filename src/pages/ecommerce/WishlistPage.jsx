import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../../components/SmartImage';

const WishlistPage = () => {
  const { wishlistItems, fetchWishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId, 1);
    if (success) {
      removeFromWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-4 mb-10">
          <Heart className="text-orange-500" size={36} />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Your Wishlist</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-700">
            <Heart size={80} className="text-slate-300 dark:text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Wishlist is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
              Save items you love to your wishlist and they will show up here.
            </p>
            <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-10 rounded-xl transition-colors shadow-lg shadow-orange-500/30">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.product_id}
                  className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <SmartImage 
                      src={getImageUrl(item.image_url)} 
                      alt={item.title} 
                      className="w-full h-full bg-transparent"
                      imageClassName="object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors z-10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <Link to={`/products/${item.product_id}`} className="block mb-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="text-xl font-bold text-orange-500 mb-6 mt-auto">
                      {formatCurrency(item.price)}
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(item.product_id)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 hover:bg-orange-500 dark:hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      <ShoppingCart size={18} />
                      Move to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
