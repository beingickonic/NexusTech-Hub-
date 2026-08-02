import React from 'react';
import { Search } from 'lucide-react';

export const SearchInput = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <input
        ref={ref}
        type="text"
        className={`w-full bg-nexus-surface dark:bg-nexus-surface border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-nexus-heading focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-muted ${className}`}
        {...props}
      />
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nexus-muted pointer-events-none" />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
export default SearchInput;
