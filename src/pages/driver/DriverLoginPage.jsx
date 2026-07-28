import { MapPin } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const DriverLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Driver',
        subtitle: 'View your daily routes, track deliveries, and submit proof of delivery.',
        icon: MapPin,
        accentHex: '#10b981', // emerald
        bgFrom: 'from-emerald-600',
        bgVia: 'via-emerald-500',
        bgTo: 'to-emerald-400',
        features: [
          'GPS turn-by-turn navigation',
          'Offline mode support',
          'Instant proof of delivery capture'
        ]
      }}
    />
  );
};

export default DriverLoginPage;
