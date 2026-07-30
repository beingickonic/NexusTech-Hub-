import React from 'react';
import { Banknote, CreditCard, ReceiptText, CheckCircle2 } from 'lucide-react';

const PaymentCard = ({ payment, onConfirmCash, onConfirmDigital, onViewReceipt }) => {
  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
      {/* Accent Edge */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        payment.status === 'completed' ? 'bg-nexus-success' : 'bg-nexus-warning'
      }`} />
      
      <div className="flex justify-between items-start mb-4 pl-2">
        <div>
          <h3 className="text-white font-bold text-lg">Order #{payment.orderNumber}</h3>
          <p className="text-nexus-textSecondary text-sm">Amount Due</p>
        </div>
        <div className="text-xl font-bold text-nexus-warning">
          ${payment.amount.toFixed(2)}
        </div>
      </div>

      <div className="bg-nexus-bg rounded-xl p-4 flex items-center justify-between mb-5 border border-nexus-border">
        <div className="flex items-center gap-3">
          {payment.method === 'COD' ? (
            <div className="w-10 h-10 rounded-full bg-nexus-warning/20 flex items-center justify-center text-nexus-warning">
              <Banknote size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-nexus-success/20 flex items-center justify-center text-nexus-success">
              <CreditCard size={20} />
            </div>
          )}
          <div>
            <div className="text-white font-medium">{payment.method === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</div>
            <div className={`text-xs ${payment.status === 'completed' ? 'text-nexus-success' : 'text-nexus-warning'}`}>
              {payment.status === 'completed' ? 'Payment Confirmed' : 'Awaiting Payment'}
            </div>
          </div>
        </div>
        {payment.status === 'completed' && (
          <CheckCircle2 size={24} className="text-nexus-success" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {payment.status !== 'completed' && payment.method === 'COD' && (
          <button 
            onClick={() => onConfirmCash(payment)}
            className="col-span-2 bg-gradient-to-r from-nexus-success to-[#047857] hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2"
          >
            <Banknote size={20} />
            Confirm Cash Received
          </button>
        )}
        
        {payment.status !== 'completed' && payment.method !== 'COD' && (
          <button 
            onClick={() => onConfirmDigital(payment)}
            className="col-span-2 bg-gradient-to-r from-nexus-primary to-nexus-warning hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-nexus-primary/20 flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Confirm Digital Payment
          </button>
        )}

        {payment.status === 'completed' && (
          <button 
            onClick={() => onViewReceipt(payment)}
            className="col-span-2 bg-nexus-bg hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all border border-nexus-border flex items-center justify-center gap-2"
          >
            <ReceiptText size={20} className="text-nexus-textSecondary" />
            View Receipt
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
