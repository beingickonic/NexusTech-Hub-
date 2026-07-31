import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../SmartImage';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartSummary } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-nexus-surface/60 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-nexus-card shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <div className="flex items-center gap-3 text-nexus-heading">
                <ShoppingBag className="text-nexus-primary" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="bg-nexus-surface text-nexus-muted text-sm py-1 px-3 rounded-full font-medium">
                  {cartItems.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-nexus-textSecondary hover:text-nexus-heading transition-colors bg-nexus-surface rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-nexus-textSecondary">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p className="text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-nexus-primary font-semibold hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg bg-nexus-surface overflow-hidden flex-shrink-0">
                         <SmartImage src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full bg-transparent" imageClassName="object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-nexus-heading truncate">{item.title}</h4>
                        <div className="text-nexus-muted text-sm mt-1">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold text-nexus-heading">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-nexus-border bg-nexus-surface/50">
                <div className="flex justify-between mb-4 text-lg">
                  <span className="font-semibold text-nexus-heading">Subtotal</span>
                  <span className="font-bold text-nexus-primary">{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                <p className="text-sm text-nexus-muted mb-6">Shipping and taxes calculated at checkout.</p>
                <Link 
                  to="/cart"
                  onClick={onClose}
                  className="w-full block text-center bg-nexus-card border-2 border-nexus-border hover:border-nexus-primary dark:hover:border-nexus-primary text-nexus-heading font-semibold py-3 rounded-xl transition-colors mb-3"
                >
                  View Full Cart
                </Link>
                <Link 
                  to="/checkout"
                  onClick={onClose}
                  className="w-full block text-center bg-nexus-primary hover:bg-nexus-primary-hover text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-primary/30"
                >
                  Checkout Now
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
