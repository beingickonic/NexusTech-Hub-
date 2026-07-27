import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const CartSummary = () => {
  const { cartSummary, cartItems } = useCart();
  
  if (cartItems.length === 0) return null;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl sticky top-24">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
      
      <div className="space-y-4 text-slate-600 dark:text-slate-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(cartSummary.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Estimate</span>
          <span className="font-semibold">{formatCurrency(cartSummary.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="font-semibold">{formatCurrency(cartSummary.tax)}</span>
        </div>
        
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
        
        <div className="flex justify-between text-lg">
          <span className="font-bold text-slate-900 dark:text-white">Total</span>
          <span className="font-bold text-orange-500">{formatCurrency(cartSummary.total)}</span>
        </div>
      </div>

      <Link 
        to="/checkout"
        className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl flex justify-center items-center transition-colors shadow-lg shadow-orange-500/30"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};

export default CartSummary;
