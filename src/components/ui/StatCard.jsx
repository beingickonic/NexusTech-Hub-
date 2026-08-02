import React from 'react';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up',
  description,
  icon: Icon,
  className = '',
  ...props
}) => {
  const isUp = trendType === 'up';

  return (
    <Card className={`p-6 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-nexus-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-nexus-primary/10 text-nexus-primary flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-nexus-heading tracking-tight">{value}</span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
            isUp ? 'bg-nexus-success/10 text-nexus-success' : 'bg-nexus-error/10 text-nexus-error'
          }`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-nexus-muted">{description}</p>
      )}
    </Card>
  );
};

export default StatCard;
