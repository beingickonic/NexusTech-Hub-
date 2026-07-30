import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import { useCart } from '../../../context/CartContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-5">
      <Heart size={36} className="text-rose-400/60" />
    </div>
    <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">Your wishlist is empty</h3>
    <p className="text-nexus-textSecondary dark:text-gray-500 text-sm max-w-xs mb-6">Save products you love to find them later.</p>
    <Link
      to="/products"
      className="px-6 py-2.5 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors"
    >
      Browse Products
    </Link>
  </motion.div>
);

const WishlistCard = ({ item, onRemove, onAddToCart }) => {
  const product = item.products;
  if (!product) return null;

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] rounded-2xl overflow-hidden hover:border-nexus-primary/30 transition-all duration-200 group"
    >
      {/* Product image */}
      <div className="relative aspect-square bg-white dark:bg-[#111827] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-700" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-nexus-primary text-slate-900 dark:text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {!product.availability && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-slate-900 dark:text-white text-sm font-semibold">Out of Stock</span>
          </div>
        )}
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            to={`/products/${product.id}`}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-slate-900 dark:text-white hover:bg-white/20 transition-colors"
            title="View Product"
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => onRemove(item.product_id)}
            className="p-2.5 rounded-full bg-red-500/20 backdrop-blur-sm text-red-400 hover:bg-red-500/40 transition-colors"
            title="Remove from Wishlist"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-slate-900 dark:text-white text-sm font-semibold line-clamp-2 mb-2 leading-snug">{product.title}</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-nexus-primary font-bold text-base">
            KES {Number(product.price).toLocaleString()}
          </span>
          {product.old_price && (
            <span className="text-nexus-textSecondary dark:text-gray-500 text-xs line-through">
              KES {Number(product.old_price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock badge */}
        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${
          product.stock > 0
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.availability || product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={13} /> Add to Cart
          </button>
          <button
            onClick={() => onRemove(item.product_id)}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#1F2937] text-nexus-textSecondary dark:text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistSection = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setWishlist(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const handleRemove = async (productId) => {
    const prev = wishlist;
    setWishlist(wishlist.filter(i => i.product_id !== productId));
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    if (error) {
      setWishlist(prev);
      toast.error('Could not remove item');
    } else {
      toast.success('Removed from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (addToCart) {
      await addToCart({ product_id: product.id, quantity: 1, product });
      toast.success('Added to cart!');
    } else {
      toast('Open the cart to proceed', { icon: '🛒' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wish List</h1>
          <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
        {wishlist.length > 0 && (
          <Link to="/products" className="text-sm text-nexus-primary hover:text-[#ff5a2e] font-medium transition-colors">
            + Add more
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map(item => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default WishlistSection;
