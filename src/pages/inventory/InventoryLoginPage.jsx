import { Warehouse } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const InventoryLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Inventory',
        subtitle: 'Manage stock levels, movements, and supplier purchase orders.',
        icon: Warehouse,
        accentHex: '#8b5cf6', // violet
        bgFrom: 'from-violet-600',
        bgVia: 'via-violet-500',
        bgTo: 'to-violet-400',
        features: [
          'Real-time stock valuation',
          'Low stock automated alerts',
          'Barcode scanning compatible'
        ]
      }}
    />
  );
};

export default InventoryLoginPage;
