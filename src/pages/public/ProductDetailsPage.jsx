import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../../components/SmartImage';
import { productService } from '../../services/productService';
import ReviewSection from '../../components/reviews/ReviewSection';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data.product || res.data);
          
          // Fetch related products (same category)
          const relatedRes = await productService.getProducts({ category_id: res.data.product?.category_id, limit: 4 });
          if (relatedRes.success && relatedRes.data?.products) {
            setRelatedProducts(relatedRes.data.products.filter(p => p.id !== res.data.product?.id).slice(0, 4));
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product", err);
        setError("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[60vh] bg-[#F8FAFC] dark:bg-dark-bg">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-gray-400 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[60vh] bg-[#F8FAFC] dark:bg-dark-bg">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Oops!</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">{error || "Product not found"}</p>
        <Link to="/products" className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-orange-600 transition-colors">
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link to="/products" className="hover:text-primary transition-colors whitespace-nowrap">Products</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white font-medium break-words max-w-full">{product.title}</span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Gallery */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white dark:bg-dark-surface rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-slate-200 dark:border-white/10 shadow-sm relative group"
            >
              {(() => {
                const rawImage = product.image_url || product.image;
                const resolvedUrl = getImageUrl(rawImage, 'medium');
                
                return (
                  <SmartImage 
                    src={resolvedUrl} 
                    alt={product.title} 
                    className="w-full h-full bg-white dark:bg-dark-surface"
                    imageClassName="object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
                  />
                );
              })()}
              {product.isSale && (
                <div className="absolute top-4 left-4 bg-[#FF724C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-glow">
                  SALE
                </div>
              )}
            </motion.div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={`aspect-square bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl overflow-hidden border-2 cursor-pointer ${idx === 1 ? 'border-primary' : 'border-transparent hover:border-primary/50'} transition-all`}>
                  <SmartImage src={getImageUrl(product.image_url)} alt="thumbnail" className="w-full h-full bg-transparent" imageClassName="object-contain p-1.5 sm:p-2" iconClassName="w-3 h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" className="opacity-50" />
              </div>
              <span className="text-sm text-slate-500 dark:text-gray-400">({product.reviews} reviews)</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600"></span>
              <span className={`text-sm font-medium ${product.availability ? 'text-green-500' : 'text-red-500'}`}>
                {product.availability ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xl text-slate-400 line-through mb-1">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>

            <p className="text-slate-600 dark:text-gray-300 mb-8 leading-relaxed">
              {product.description || product.short_desc || "No description provided."}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
              <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface overflow-hidden self-start">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-slate-500 hover:text-primary transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >-</button>
                <span className="w-12 text-center font-semibold text-slate-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-slate-500 hover:text-primary transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >+</button>
              </div>
              <button 
                onClick={async () => {
                  setIsAdding(true);
                  await addToCart(product.id, quantity);
                  setIsAdding(false);
                }}
                disabled={isAdding || !product.availability}
                className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 sm:px-8 rounded-xl shadow-glow transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isAdding ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingCart size={20} />}
                Add to Cart
              </button>
              <button 
                onClick={() => addToWishlist(product.id)}
                className={`p-3 border rounded-xl transition-colors self-start sm:self-auto ${
                  isWishlisted && isWishlisted(product.id) 
                    ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-500/10' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-dark-surface text-slate-600 dark:text-gray-300 hover:text-primary hover:border-primary'
                }`}
              >
                <Heart size={22} fill={isWishlisted && isWishlisted(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Features/Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
                <ShieldCheck className="text-primary" size={20} /> 1 Year Warranty
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
                <Truck className="text-primary" size={20} /> Free Shipping & Delivery
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
                <RotateCcw className="text-primary" size={20} /> 30-Day Easy Returns
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-500 dark:text-gray-400">
              <p>SKU: <span className="font-medium text-slate-900 dark:text-white">{product.sku}</span></p>
              <p className="mt-1">Category: <span className="font-medium text-slate-900 dark:text-white">{product.category}</span></p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto no-scrollbar">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-8 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="text-slate-600 dark:text-gray-300 leading-relaxed min-h-[200px]">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Product Overview</h3>
                <p className="mb-6">{product.description || product.short_desc}</p>
                {product.features && (Array.isArray(product.features) ? product.features : (typeof product.features === 'string' ? product.features.split(/[,\n]/).filter(f => f.trim()) : [])).length > 0 && (
                  <>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-6">Key Features</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {(Array.isArray(product.features) ? product.features : (typeof product.features === 'string' ? product.features.split(/[,\n]/).filter(f => f.trim()) : [])).map((f, i) => <li key={i}>{typeof f === 'string' ? f.trim() : f}</li>)}
                    </ul>
                  </>
                )}
              </motion.div>
            )}
            {activeTab === 'specifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p>Technical specifications will be listed here.</p>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ReviewSection productId={id} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailsPage;
