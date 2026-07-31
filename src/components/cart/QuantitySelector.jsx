import { Minus, Plus } from 'lucide-react';

const QuantitySelector = ({ quantity, onIncrease, onDecrease, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 border border-nexus-border rounded-lg p-1 bg-nexus-card ${className}`}>
      <button 
        onClick={onDecrease} 
        disabled={quantity <= 1}
        className="p-1 rounded-md text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-sm font-medium text-nexus-heading">
        {quantity}
      </span>
      <button 
        onClick={onIncrease} 
        className="p-1 rounded-md text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
