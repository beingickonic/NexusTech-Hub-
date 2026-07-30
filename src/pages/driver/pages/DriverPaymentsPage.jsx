import React, { useState } from 'react';
import PaymentCard from '../../../components/driver/PaymentCard';
import { Banknote } from 'lucide-react';

const DriverPaymentsPage = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      orderNumber: 'ORD-8902',
      amount: 45.50,
      method: 'COD',
      status: 'pending'
    },
    {
      id: 2,
      orderNumber: 'ORD-8903',
      amount: 120.00,
      method: 'Online',
      status: 'pending'
    },
    {
      id: 3,
      orderNumber: 'ORD-8901',
      amount: 65.00,
      method: 'COD',
      status: 'completed'
    }
  ]);

  const handleConfirmCash = (payment) => {
    setPayments(payments.map(p => p.id === payment.id ? { ...p, status: 'completed' } : p));
  };

  const handleConfirmDigital = (payment) => {
    setPayments(payments.map(p => p.id === payment.id ? { ...p, status: 'completed' } : p));
  };

  const handleViewReceipt = (payment) => {
    alert(`Viewing Receipt for Order #${payment.orderNumber}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-nexus-warning/20 flex items-center justify-center">
          <Banknote className="text-nexus-warning" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm text-nexus-textSecondary">Manage Cash on Delivery.</p>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map(payment => (
          <PaymentCard 
            key={payment.id} 
            payment={payment} 
            onConfirmCash={handleConfirmCash}
            onConfirmDigital={handleConfirmDigital}
            onViewReceipt={handleViewReceipt}
          />
        ))}
      </div>
    </div>
  );
};

export default DriverPaymentsPage;
