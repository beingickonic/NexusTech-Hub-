import React, { useState } from 'react';
import RouteStopCard from '../../../components/driver/RouteStopCard';
import { Truck } from 'lucide-react';

const DriverRoutePage = () => {
  const [stops, setStops] = useState([
    {
      id: 1,
      stopNumber: 1,
      customerName: 'Emily Watson',
      address: '12 Developer Way',
      distance: '0.5 mi',
      eta: '10:15 AM',
      status: 'completed',
      isLast: false
    },
    {
      id: 2,
      stopNumber: 2,
      customerName: 'Marcus Cole',
      address: '78 Innovation Blvd, Suite 200',
      distance: '2.1 mi',
      eta: '10:45 AM',
      status: 'arrived',
      isLast: false
    },
    {
      id: 3,
      stopNumber: 3,
      customerName: 'Sarah Jenkins',
      address: '423 Tech Park Ave, Block C, Room 402',
      distance: '4.5 mi',
      eta: '11:30 AM',
      status: 'pending',
      isLast: true
    }
  ]);

  const handleNavigate = (stop) => {
    alert(`Opening Maps for ${stop.address}`);
  };

  const handleMarkArrived = (stop) => {
    setStops(stops.map(s => s.id === stop.id ? { ...s, status: 'arrived' } : s));
  };

  const handleComplete = (stop) => {
    setStops(stops.map(s => s.id === stop.id ? { ...s, status: 'completed' } : s));
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-primary to-nexus-warning flex items-center justify-center">
          <Truck className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Route</h1>
          <p className="text-sm text-nexus-textSecondary">Optimised for fastest delivery.</p>
        </div>
      </div>

      <div className="mt-4">
        {stops.map(stop => (
          <RouteStopCard 
            key={stop.id} 
            stop={stop} 
            onNavigate={handleNavigate}
            onMarkArrived={handleMarkArrived}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
};

export default DriverRoutePage;
