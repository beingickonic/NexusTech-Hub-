import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import SmartImage from './SmartImage';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted } = useWishlist();
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl dark:shadow-none border border-slate-200 dark:border-white/5 transition-all duration-300 hover:shadow-glow hover:border-primary/50 flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.old_price && (
          <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md">
            SALE
          </span>
        )}
        {product.new_arrival && (
          <span className="bg-accent text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        aria-label="Add to wishlist"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToWishlist(product.id);
        }}
        className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
          isWishlisted && isWishlisted(product.id)
            ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500/30'
            : 'bg-white/80 dark:bg-dark-bg/80 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-dark-bg'
        }`}
      >
        <Heart size={18} fill={isWishlisted && isWishlisted(product.id) ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 block">
        {(() => {
          const rawImage = product.image_url || product.image;
          const resolvedUrl = getImageUrl(rawImage, 'thumb');
          
          return (
            <SmartImage 
              src={resolvedUrl} 
              alt={product.title} 
              className="w-full h-full bg-transparent"
              imageClassName="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-110"
            />
          );
        })()}
        
        {/* Quick Actions (Hover) */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20 flex justify-center gap-2">
          <div 
            className="flex-1 bg-white dark:bg-dark-bg text-slate-900 dark:text-white font-medium py-2.5 rounded-lg shadow-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye size={16} /> Quick View
          </div>
        </div>
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-accent">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-xs text-slate-500 dark:text-gray-400">({product.reviews})</span>
        </div>
        
        <Link to={`/products/${product.id}`} className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 leading-snug hover:text-primary transition-colors">
          {product.title}
        </Link>
        
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 line-clamp-1">
          {product.category}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.old_price)}
              </span>
            )}
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <button 
            aria-label="Add to cart"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await addToCart(product.id, 1);
            }}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-slate-900 dark:text-white hover:bg-[#FF724C] hover:text-white dark:hover:bg-primary transition-colors z-20 relative"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
