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
      <span className={row.current_stock <= row.min_stock ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-nexus-textSecondary'}>
        {row.current_stock} {row.unit}
      </span>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.status === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
        row.status === 'Out of Stock' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
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
