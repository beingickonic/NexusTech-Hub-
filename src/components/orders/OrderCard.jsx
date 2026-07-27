import { Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import OrderStatus from './OrderStatus';

const OrderCard = ({ order }) => {
  const date = new Date(order.placed_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Order {order.order_number}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Placed on {date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(order.total_amount)}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
            <OrderStatus status={order.status} />
          </div>

          <Link 
            to={`/orders/${order.id}`}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition-colors bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl"
          >
            View <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderCard;
