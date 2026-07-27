import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import orderService from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import EmptyOrders from '../../components/orders/EmptyOrders';
import { Package } from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const res = await orderService.getOrders();
          if (res.success) {
            setOrders(res.data.orders || []);
          }
        } catch (error) {
          console.error("Error fetching orders", error);
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Package className="text-orange-500" size={36} />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Order History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
