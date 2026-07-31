import OrdersTable from '../../components/admin/OrdersTable';

const OrdersPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexus-heading mb-2">Orders Management</h1>
        <p className="text-nexus-muted">Track and manage customer orders, update shipping statuses, and process refunds.</p>
      </div>

      <OrdersTable />
    </div>
  );
};

export default OrdersPage;
