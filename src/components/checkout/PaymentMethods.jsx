import { CreditCard, Smartphone, Banknote } from 'lucide-react';

const PaymentMethods = ({ selected, onSelect }) => {
  const methods = [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, desc: 'Pay via Safaricom STK Push' },
    { id: 'flutterwave', name: 'Card / Mobile Money', icon: CreditCard, desc: 'Visa, Mastercard, Mobile Money' },
    { id: 'paypal', name: 'PayPal', icon: Banknote, desc: 'Pay via PayPal (USD only)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map(method => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          
          return (
            <div 
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className={`font-bold ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>{method.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{method.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selected === 'mpesa' && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">M-Pesa Phone Number</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
              +254
            </span>
            <input 
              type="tel" 
              className="flex-1 px-4 py-3 rounded-r-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
              placeholder="700 000000"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">A prompt will be sent to this number to enter your PIN upon checkout.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
