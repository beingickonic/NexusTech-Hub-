import ProductTable from '../../components/admin/ProductTable';

const ProductsPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Products Management</h1>
        <p className="text-slate-500 dark:text-slate-400">View, add, edit, and delete products from your store.</p>
      </div>

      <ProductTable />
    </div>
  );
};

export default ProductsPage;
