import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../SmartImage';

const OrderSummary = ({ cartItems, cartSummary }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-nexus-border rounded-3xl p-6 shadow-xl sticky top-24">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Review Order</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {cartItems.map(item => (
          <div key={item.product_id} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
              <SmartImage src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full bg-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</h4>
              <p className="text-xs text-nexus-textSecondary mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white text-right">
              {formatCurrency(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-sm text-slate-600 dark:text-nexus-textSecondary">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{formatCurrency(cartSummary.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-semibold">{formatCurrency(cartSummary.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes</span>
          <span className="font-semibold">{formatCurrency(cartSummary.tax)}</span>
        </div>
        
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
        
        <div className="flex justify-between text-lg">
          <span className="font-bold text-slate-900 dark:text-white">Total to Pay</span>
          <span className="font-bold text-orange-500">{formatCurrency(cartSummary.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
