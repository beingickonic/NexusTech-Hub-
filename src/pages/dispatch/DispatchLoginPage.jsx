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
        bgFrom: 'from-nexus-gold',
        bgVia: 'via-nexus-light-gold',
        bgTo: 'to-nexus-light-gold',
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
