import React from 'react';

export const Textarea = React.forwardRef(({
  className = '',
  label,
  error,
  required = false,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-nexus-heading">
          {label}
          {required && <span className="text-nexus-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full rounded-xl border border-nexus-border bg-nexus-card text-nexus-heading px-4 py-2.5 text-sm transition-all duration-200 outline-none focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/20 placeholder:text-nexus-muted disabled:opacity-50 min-h-[100px] ${
          error ? 'border-nexus-error focus:border-nexus-error focus:ring-nexus-error/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-nexus-error mt-1">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
