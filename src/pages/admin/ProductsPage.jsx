import ProductTable from '../../components/admin/ProductTable';

const ProductsPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexus-heading mb-2">Products Management</h1>
        <p className="text-nexus-muted">View, add, edit, and delete products from your store.</p>
      </div>

      <ProductTable />
    </div>
  );
};

export default ProductsPage;
