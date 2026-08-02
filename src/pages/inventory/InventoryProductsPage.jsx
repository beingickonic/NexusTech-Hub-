import React, { useState, useEffect } from 'react';
import { Plus, Edit, Package, ArrowRightLeft } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

const InventoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // General dropdown for top-right "Adjust Stock" button
  const [allProducts, setAllProducts] = useState([]);

  // Adjust stock states
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Manual stock adjustment');

  // Edit product states
  const [editTitle, setEditTitle] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { success, data } = await inventoryService.getInventoryItems({ search: searchQuery });
      if (success) {
        const mapped = data.map(p => ({
          id: p.id,
          title: p.title,
          sku: p.sku || 'N/A',
          barcode: p.barcode || 'N/A',
          category: p.category_name || 'Uncategorized',
          price: p.price || 0,
          cost_price: p.cost_price || 0,
          quantity: p.quantity_on_hand || 0,
          reserved: p.quantity_reserved || 0,
          available: p.quantity_available || 0,
          image_url: p.image_url
        }));
        setProducts(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  useEffect(() => {
    if (isAdjustModalOpen && !selectedProduct) {
      inventoryService.getProducts().then(res => {
        if (res.success) setAllProducts(res.data || []);
      });
    }
  }, [isAdjustModalOpen, selectedProduct]);

  const handleOpenAdjust = (product = null) => {
    setSelectedProduct(product);
    if (product) {
      setAdjustQty(product.quantity);
    } else {
      setAdjustQty('');
    }
    setAdjustReason('Manual stock adjustment');
    setIsAdjustModalOpen(true);
  };

  const handleSelectProductInAdjust = (productId) => {
    const prod = allProducts.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct({
        id: prod.id,
        title: prod.title,
        quantity: prod.stock || 0
      });
      setAdjustQty(prod.stock || 0);
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setEditTitle(product.title);
    setEditSku(product.sku);
    setEditPrice(product.price);
    setEditCostPrice(product.cost_price);
    setEditQuantity(product.quantity);
    setIsEditModalOpen(true);
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      const res = await inventoryService.adjustStock(selectedProduct.id, {
        quantity: Number(adjustQty),
        reason: adjustReason
      });
      if (res.success) {
        toast.success("Stock level updated successfully");
        setIsAdjustModalOpen(false);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to adjust stock");
      }
    } catch (err) {
      toast.error("Error occurred while saving adjustments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      const res = await inventoryService.updateProductBaseline(selectedProduct.id, {
        title: editTitle,
        sku: editSku,
        price: Number(editPrice),
        cost_price: Number(editCostPrice),
        quantity: Number(editQuantity)
      });
      if (res.success) {
        toast.success("Product baseline values saved");
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to update product");
      }
    } catch (err) {
      toast.error("Error editing product details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory & Stock Manager"
        subtitle="Track stock levels, modify product parameters, and audit reserves"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => handleOpenAdjust(null)} variant="primary" size="sm" className="gap-2">
              <ArrowRightLeft size={16} /> Adjust Stock
            </Button>
          </div>
        }
      />

      <Card className="p-4" hoverElevation={false}>
        <div className="mb-4">
          <SearchInput
            placeholder="Search items by name, SKU or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No inventory products found"
            description="Products matching your query could not be loaded."
            icon={Package}
          />
        ) : (
          <Table headers={['Product Details', 'SKU / Barcode', 'Sales Price', 'Cost Price', 'On Hand', 'Reserved', 'Available', 'Actions']}>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} className="w-10 h-10 object-cover rounded-lg border border-nexus-border" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-nexus-surface rounded-lg flex items-center justify-center text-nexus-muted">
                        <Package size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-nexus-heading text-sm">{product.title}</p>
                      <p className="text-xs text-nexus-muted">{product.category}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-mono text-nexus-heading">SKU: {product.sku}</div>
                  <div className="text-xs text-nexus-muted mt-0.5">BC: {product.barcode}</div>
                </TableCell>
                <TableCell className="font-medium text-nexus-heading">${Number(product.price).toFixed(2)}</TableCell>
                <TableCell className="text-nexus-muted">${Number(product.cost_price).toFixed(2)}</TableCell>
                <TableCell className="font-bold text-nexus-heading">{product.quantity}</TableCell>
                <TableCell className="text-nexus-muted">{product.reserved}</TableCell>
                <TableCell>
                  <Badge variant={product.available > 5 ? 'success' : 'pending'}>
                    {product.available} units
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button onClick={() => handleOpenAdjust(product)} variant="ghost" size="sm" className="p-2" title="Adjust Stock">
                      <ArrowRightLeft size={15} />
                    </Button>
                    <Button onClick={() => handleOpenEdit(product)} variant="secondary" size="sm" className="p-2" title="Edit Parameters">
                      <Edit size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Adjust Stock Level Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={selectedProduct ? `Adjust Stock: ${selectedProduct.title}` : "Adjust Inventory Level"}
        footer={
          <>
            <Button onClick={() => setIsAdjustModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button onClick={submitAdjust} disabled={isSubmitting} variant="primary" size="sm">
              {isSubmitting ? 'Saving...' : 'Save Adjustments'}
            </Button>
          </>
        }
      >
        <form onSubmit={submitAdjust} className="space-y-4">
          {!selectedProduct && (
            <Select
              label="Choose Product"
              onChange={(e) => handleSelectProductInAdjust(e.target.value)}
              required
            >
              <option value="">-- Choose Product --</option>
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>{p.title} (Current: {p.stock})</option>
              ))}
            </Select>
          )}

          <Input
            label="New Stock Level"
            type="number"
            min="0"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            required
            placeholder="Enter new quantity"
          />
          {selectedProduct && (
            <span className="text-[11px] text-nexus-muted block">
              Current: {selectedProduct.quantity} (Difference: {Number(adjustQty || 0) - selectedProduct.quantity})
            </span>
          )}

          <Textarea
            label="Adjustment Reason"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
        footer={
          <>
            <Button onClick={() => setIsEditModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={isSubmitting} variant="primary" size="sm">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={submitEdit} className="space-y-4">
          <Input
            label="Product Title"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU ID"
              type="text"
              value={editSku}
              onChange={(e) => setEditSku(e.target.value)}
              required
            />
            <Input
              label="Stock Level"
              type="number"
              min="0"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              required
            />
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={editCostPrice}
              onChange={(e) => setEditCostPrice(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryProductsPage;
