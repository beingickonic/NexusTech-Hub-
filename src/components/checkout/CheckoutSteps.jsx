import { Check } from 'lucide-react';

const CheckoutSteps = ({ currentStep }) => {
  const steps = ['Shipping Info', 'Payment Method', 'Review Order'];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <div key={step} className="flex items-center w-full relative">
            {/* Connecting line */}
            {index !== steps.length - 1 && (
              <div className={`absolute top-1/2 left-[50%] w-full h-[2px] -translate-y-1/2 -z-10 transition-colors ${
                isCompleted ? 'bg-nexus-primary' : 'bg-nexus-surface dark:bg-nexus-card'
              }`}></div>
            )}
            
            <div className="flex flex-col items-center w-full gap-2 bg-nexus-surface relative z-10 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                isActive 
                  ? 'bg-nexus-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/20' 
                  : isCompleted
                    ? 'bg-nexus-primary text-white'
                    : 'bg-nexus-card text-nexus-textSecondary border-2 border-nexus-border'
              }`}>
                {isCompleted ? <Check size={20} /> : stepNum}
              </div>
              <span className={`text-xs md:text-sm font-medium ${
                isActive ? 'text-nexus-primary' : isCompleted ? 'text-nexus-heading' : 'text-nexus-textSecondary'
              }`}>
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
