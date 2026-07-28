import { Truck } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const DispatchLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Dispatch',
        subtitle: 'Manage deliveries, drivers, and tracking in real-time.',
        icon: Truck,
        accentHex: '#f59e0b', // amber
        bgFrom: 'from-amber-600',
        bgVia: 'via-amber-500',
        bgTo: 'to-amber-400',
        features: [
          'Live driver tracking & status',
          'Automated delivery routing',
          'Instant proof of delivery'
        ]
      }}
    />
  );
};

export default DispatchLoginPage;
