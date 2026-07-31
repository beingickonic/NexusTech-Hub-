import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-nexus-card backdrop-blur-sm border border-nexus-border shadow-sm"
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-nexus-surface flex-shrink-0">
        <img 
          src={item.image_url || 'https://via.placeholder.com/150'} 
          alt={item.title} 
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-nexus-heading line-clamp-2">{item.title}</h3>
            <p className="text-nexus-primary font-bold mt-1">{formatCurrency(item.price)}</p>
          </div>
          <button 
            onClick={() => removeFromCart(item.product_id)}
            className="text-nexus-textSecondary hover:text-nexus-error transition-colors p-2"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <QuantitySelector 
            quantity={item.quantity}
            onDecrease={() => updateQuantity(item.product_id, item.quantity - 1)}
            onIncrease={() => updateQuantity(item.product_id, item.quantity + 1)}
          />
          <div className="text-right">
            <span className="text-sm text-nexus-muted block">Subtotal</span>
            <span className="font-semibold text-nexus-heading">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
