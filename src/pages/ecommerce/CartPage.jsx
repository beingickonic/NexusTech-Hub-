import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, fetchCart, loading } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-nexus-surface transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">Shopping Cart</h1>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-nexus-border">
            <ShoppingBag size={80} className="text-nexus-textSecondary dark:text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-nexus-textSecondary dark:text-nexus-textSecondary mb-8 max-w-md text-center">
              Looks like you haven't added anything to your cart yet. Let's fix that!
            </p>
            <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-10 rounded-xl transition-colors shadow-lg shadow-orange-500/30">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 relative">
            <div className="flex-1 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <CartItem key={item.product_id} item={item} />
                ))}
              </AnimatePresence>
            </div>
            
            <div className="w-full lg:w-[400px]">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
