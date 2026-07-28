import { Building2 } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const SupplierLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Supplier',
        subtitle: 'Manage purchase orders, deliveries, and view invoices.',
        icon: Building2,
        accentHex: '#14b8a6', // teal
        bgFrom: 'from-teal-600',
        bgVia: 'via-teal-500',
        bgTo: 'to-teal-400',
        features: [
          'View and accept purchase orders',
          'Track delivery schedules',
          'Submit and track invoices'
        ]
      }}
    />
  );
};

export default SupplierLoginPage;
