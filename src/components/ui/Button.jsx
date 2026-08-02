import React from 'react';

export const Button = React.forwardRef(({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nexus-primary/40 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-nexus-primary text-white shadow-soft hover:bg-nexus-primary-hover',
    secondary: 'bg-white dark:bg-nexus-surface border border-nexus-border text-nexus-heading hover:bg-nexus-primary/5 dark:hover:bg-nexus-hover/10 dark:hover:text-nexus-primary',
    outline: 'border border-nexus-primary text-nexus-primary hover:bg-nexus-primary hover:text-white',
    ghost: 'bg-transparent text-nexus-primary hover:bg-nexus-primary/10',
    danger: 'bg-nexus-error text-white shadow-soft hover:bg-nexus-error/90',
    success: 'bg-nexus-success text-white shadow-soft hover:bg-nexus-success/90',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
