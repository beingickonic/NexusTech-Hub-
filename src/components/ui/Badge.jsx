import React from 'react';

export const Badge = ({
  children,
  variant = 'pending',
  className = '',
  ...props
}) => {
  const styles = {
    pending: 'bg-nexus-primary/10 text-nexus-primary border-nexus-primary/20',
    processing: 'bg-nexus-gold/10 text-nexus-gold border-nexus-gold/20',
    approved: 'bg-nexus-success/10 text-nexus-success border-nexus-success/20',
    completed: 'bg-nexus-success/10 text-nexus-success border-nexus-success/20',
    success: 'bg-nexus-success/10 text-nexus-success border-nexus-success/20',
    cancelled: 'bg-nexus-error/10 text-nexus-error border-nexus-error/20',
    rejected: 'bg-nexus-error/10 text-nexus-error border-nexus-error/20',
    danger: 'bg-nexus-error/10 text-nexus-error border-nexus-error/20',
    info: 'bg-nexus-info/10 text-nexus-info border-nexus-info/20',
  };

  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border';

  return (
    <span
      className={`${baseStyles} ${styles[variant.toLowerCase()] || styles.pending} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
