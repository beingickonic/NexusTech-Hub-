import { Check, Circle } from 'lucide-react';

const TrackingTimeline = ({ status }) => {
  const steps = [
    { id: 'pending', label: 'Order Placed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);
  // If cancelled/refunded, we might not show standard timeline or show it differently. 
  // We'll just highlight up to where it got.

  return (
    <div className="relative flex flex-col md:flex-row justify-between w-full mt-8 mb-4">
      {/* Connecting line background */}
      <div className="absolute left-[15px] md:left-0 top-0 md:top-[15px] h-full md:h-[2px] w-[2px] md:w-full bg-slate-200 dark:bg-slate-700 -z-10"></div>
      
      {/* Active connecting line */}
      <div 
        className="absolute left-[15px] md:left-0 top-0 md:top-[15px] h-full md:h-[2px] w-[2px] bg-orange-500 -z-10 transition-all duration-500"
        style={{ 
          height: window.innerWidth < 768 ? `${Math.max(0, currentStepIndex) * 25}%` : '2px',
          width: window.innerWidth >= 768 ? `${Math.max(0, currentStepIndex) * 25}%` : '2px'
        }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        return (
          <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 mb-8 md:mb-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
              isCompleted 
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
            }`}>
              {isCompleted ? <Check size={16} strokeWidth={3} /> : <Circle size={10} fill="currentColor" />}
            </div>
            <span className={`text-sm font-medium ${isCurrent ? 'text-orange-500' : (isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
