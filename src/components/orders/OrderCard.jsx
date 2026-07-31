import { Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import OrderStatus from './OrderStatus';

const OrderCard = ({ order }) => {
  const date = new Date(order.created_at || order.placed_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white/60 dark:bg-nexus-card/60 backdrop-blur-md border border-nexus-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-nexus-primary/15 dark:bg-nexus-primary/20 flex items-center justify-center text-nexus-primary">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-bold text-nexus-heading text-lg">
              Order {order.order_number}
            </h3>
            <p className="text-nexus-muted text-sm">Placed on {date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
          <div>
            <p className="text-sm text-nexus-muted mb-1">Total Amount</p>
            <p className="font-bold text-nexus-heading">{formatCurrency(order.total_amount)}</p>
          </div>
          
          <div>
            <p className="text-sm text-nexus-muted mb-1">Status</p>
            <OrderStatus status={order.status} />
          </div>

          <Link 
            to={`/orders/${order.id}`}
            className="flex items-center gap-2 text-nexus-primary hover:text-nexus-primary font-medium transition-colors bg-nexus-primary/10 dark:bg-nexus-primary/10 px-4 py-2 rounded-xl"
          >
            View <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderCard;
