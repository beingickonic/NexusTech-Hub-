import { CreditCard, Smartphone, Banknote, Zap } from 'lucide-react';

const PaymentMethods = ({ selected, onSelect }) => {
  const methods = [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, desc: 'Pay via Safaricom STK Push' },
    { id: 'flutterwave', name: 'Card / Mobile Money', icon: CreditCard, desc: 'Visa, Mastercard, Mobile Money' },
    { id: 'paypal', name: 'PayPal', icon: Banknote, desc: 'Pay via PayPal (USD only)' },
    { id: 'mock', name: 'Mock Mobile Money', icon: Zap, desc: 'Test payments with verification codes' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-nexus-heading mb-4">Select Payment Method</h3>
      
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
                  ? 'border-nexus-primary bg-nexus-primary/10 dark:bg-nexus-primary/10' 
                  : 'border-nexus-border bg-nexus-card hover:border-nexus-primary/30'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-nexus-primary text-white shadow-lg shadow-primary/30' : 'bg-nexus-surface text-nexus-muted'}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className={`font-bold ${isSelected ? 'text-nexus-primary' : 'text-nexus-heading'}`}>{method.name}</h4>
                  <p className="text-xs text-nexus-muted mt-1">{method.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selected === 'mpesa' && (
        <div className="mt-6 p-4 bg-nexus-surface rounded-xl border border-nexus-border">
          <label className="block text-sm font-medium text-nexus-muted mb-2">M-Pesa Phone Number</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-nexus-border bg-nexus-surface text-nexus-textSecondary font-bold">
              +254
            </span>
            <input 
              type="tel" 
              className="flex-1 px-4 py-3 rounded-r-xl bg-nexus-card border border-nexus-border focus:ring-2 focus:ring-nexus-primary outline-none dark:text-white"
              placeholder="700 000000"
            />
          </div>
          <p className="text-xs text-nexus-textSecondary mt-2">A prompt will be sent to this number to enter your PIN upon checkout.</p>
        </div>
      )}
      {selected === 'mock' && (
        <div className="mt-6 p-4 bg-nexus-surface rounded-xl border border-nexus-border">
          <p className="text-sm font-medium text-nexus-muted mb-2">Developer / Demo Mode</p>
          <p className="text-xs text-nexus-textSecondary leading-relaxed">
            You will be asked to enter a verification code on the next screen.
            Use one of: <code className="font-mono bg-nexus-card px-1 py-0.5 rounded text-nexus-primary">123456</code>,{' '}
            <code className="font-mono bg-nexus-card px-1 py-0.5 rounded text-nexus-primary">111111</code>,{' '}
            <code className="font-mono bg-nexus-card px-1 py-0.5 rounded text-nexus-primary">999999</code>,{' '}
            <code className="font-mono bg-nexus-card px-1 py-0.5 rounded text-nexus-primary">NEXUS123</code>,{' '}
            <code className="font-mono bg-nexus-card px-1 py-0.5 rounded text-nexus-primary">TESTPAY</code>.
            Any other code will be rejected as a failed payment.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
