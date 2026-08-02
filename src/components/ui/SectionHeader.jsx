import React from 'react';

export const SectionHeader = ({
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center justify-between border-b border-nexus-border pb-3 mb-4 ${className}`} {...props}>
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-nexus-heading">{title}</h3>
        {subtitle && <p className="text-xs text-nexus-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
