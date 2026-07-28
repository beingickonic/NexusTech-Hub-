import { TrendingUp } from 'lucide-react';
import PortalLoginPage from '../../components/portal/PortalLoginPage';

const FinanceLoginPage = () => {
  return (
    <PortalLoginPage
      portalConfig={{
        name: 'Finance',
        subtitle: 'Track revenue, expenses, and financial health in real-time.',
        icon: TrendingUp,
        accentHex: '#3b82f6', // blue
        bgFrom: 'from-blue-600',
        bgVia: 'via-blue-500',
        bgTo: 'to-blue-400',
        features: [
          'Live profit & loss tracking',
          'Automated invoice generation',
          'Expense and payroll management'
        ]
      }}
    />
  );
};

export default FinanceLoginPage;
