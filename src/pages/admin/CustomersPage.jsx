import CustomerTable from '../../components/admin/CustomerTable';

const CustomersPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Customers</h1>
        <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">Manage your user base, view order history, and handle accounts.</p>
      </div>

      <CustomerTable />
    </div>
  );
};

export default CustomersPage;
