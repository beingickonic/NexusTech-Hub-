import React from 'react';
import { Box } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'Get started by creating a new item.',
  icon: Icon = Box,
  actionLabel,
  onAction,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-nexus-border bg-nexus-card/30 min-h-[300px] ${className}`}
      {...props}
    >
      <div className="w-12 h-12 rounded-xl bg-nexus-primary/10 text-nexus-primary flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-nexus-heading">{title}</h3>
      <p className="text-sm text-nexus-muted mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
