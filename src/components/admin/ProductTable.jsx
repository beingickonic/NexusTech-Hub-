import { useState, useEffect } from 'react';
import { Edit, Trash2, MoreVertical, Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../SmartImage';

const ProductTable = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (currentPage = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const response = await adminService.getProducts({ page: currentPage, search: searchQuery });
      if (response.status === 'success') {
        setProducts(response.data);
        if (response.meta) setMeta(response.meta);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchProducts(newPage, search);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminService.deleteProduct(id);
        fetchProducts(meta.page, search);
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  return (
    <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-nexus-border">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
          />
          <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto">
            <Filter size={16} /> Filter
          </button>
          <Link to="/admin/products/add" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/30 w-full sm:w-auto">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-nexus-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-nexus-card overflow-hidden flex-shrink-0 border border-nexus-border p-1 flex items-center justify-center">
                        {product.image_url ? (
                         (() => {
                           const rawImage = product.image_url;
                           const resolvedUrl = getImageUrl(rawImage, 'thumb');
                           return (
                             <SmartImage 
                               src={resolvedUrl} 
                               alt={product.title} 
                               className="w-full h-full bg-transparent" 
                               imageClassName="object-contain mix-blend-multiply dark:mix-blend-normal" 
                               iconClassName="w-4 h-4" 
                             />
                           );
                         })()
                        ) : (
                           <div className="text-nexus-textSecondary text-xs text-center leading-tight">No Img</div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-nexus-heading line-clamp-1">{product.title}</h4>
                        <p className="text-xs text-nexus-muted mt-0.5">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-nexus-muted">
                    <span className="bg-nexus-surface px-2.5 py-1 rounded-md text-xs font-medium">
                      {product.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-nexus-heading">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-nexus-muted">
                    <span className={parseInt(product.stock) <= 5 ? "text-nexus-error font-bold" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.availability === true ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success border border-nexus-success/20 dark:border-nexus-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-nexus-success"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-textSecondary border border-nexus-border dark:border-nexus-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-nexus-muted"></span>
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-nexus-textSecondary hover:text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-muted">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
