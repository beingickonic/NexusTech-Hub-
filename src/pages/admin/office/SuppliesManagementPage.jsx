import React, { useState, useEffect } from 'react';
import OfficeDataTable from '../../../components/admin/office/OfficeDataTable';
import { officeService } from '../../../services/officeService';
import toast from 'react-hot-toast';

const SuppliesManagementPage = () => {
  const [supplies, setSupplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupplies = async () => {
    setIsLoading(true);
    try {
      const { data } = await officeService.getSupplies();
      setSupplies(data || []);
    } catch (error) {
      console.error("Error fetching supplies:", error);
      toast.error("Failed to load supplies. Verify database schema.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const handleAdd = () => {
    toast('Add functionality will open a modal.', { icon: '🚧' });
  };

  const handleEdit = (supply) => {
    toast(`Edit supply: ${supply.item_name}`, { icon: '✏️' });
  };

  const handleDelete = async (id) => {
    try {
      await officeService.deleteSupply(id);
      setSupplies(supplies.filter(s => s.id !== id));
      toast.success("Supply record deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete supply record");
    }
  };

  const columns = [
    { header: 'Item Name', accessor: 'item_name', render: (row) => <span className="font-semibold">{row.item_name}</span> },
    { header: 'Stock', accessor: 'current_stock', render: (row) => (
      <span className={row.current_stock <= row.min_stock ? 'text-nexus-error font-bold' : 'text-nexus-muted'}>
        {row.current_stock} {row.unit}
      </span>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.status === 'In Stock' ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' :
        row.status === 'Out of Stock' ? 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error' :
        'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Location', accessor: 'location', render: (row) => row.location || 'N/A' },
    { header: 'Supplier', accessor: 'supplier', render: (row) => row.supplier || 'N/A' }
  ];

  return (
    <OfficeDataTable
      title="Supplies Management"
      description="Track office supplies, restock quantities, and manage suppliers."
      columns={columns}
      data={supplies}
      isLoading={isLoading}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      searchPlaceholder="Search supplies..."
    />
  );
};

export default SuppliesManagementPage;
