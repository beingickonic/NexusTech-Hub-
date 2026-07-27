import { Minus, Plus } from 'lucide-react';

const QuantitySelector = ({ quantity, onIncrease, onDecrease, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-900 ${className}`}>
      <button 
        onClick={onDecrease} 
        disabled={quantity <= 1}
        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-sm font-medium text-slate-800 dark:text-slate-200">
        {quantity}
      </span>
      <button 
        onClick={onIncrease} 
        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
