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
      className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
        <img 
          src={item.image_url || 'https://via.placeholder.com/150'} 
          alt={item.title} 
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{item.title}</h3>
            <p className="text-orange-500 font-bold mt-1">{formatCurrency(item.price)}</p>
          </div>
          <button 
            onClick={() => removeFromCart(item.product_id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
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
            <span className="text-sm text-slate-500 dark:text-slate-400 block">Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
