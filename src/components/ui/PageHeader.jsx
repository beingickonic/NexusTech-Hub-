import React from 'react';
import Breadcrumb from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-3 mb-6 ${className}`} {...props}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-nexus-heading">{title}</h1>
          {subtitle && <p className="text-sm text-nexus-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
