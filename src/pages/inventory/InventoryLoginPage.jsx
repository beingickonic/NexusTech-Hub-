import { Warehouse } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const InventoryLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Inventory',
        subtitle: 'Manage stock levels, movements, and supplier purchase orders.',
        icon: Warehouse,
        accentHex: '#FF6B57', // primary
        bgFrom: 'from-nexus-primary',
        bgVia: 'via-nexus-primary',
        bgTo: 'to-nexus-primary-hover',
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
