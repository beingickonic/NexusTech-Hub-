import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumb = ({
  items = [],
  className = '',
  ...props
}) => {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-nexus-muted font-medium ${className}`} {...props}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={12} className="text-nexus-muted/60" />}
            {isLast ? (
              <span className="text-nexus-heading font-semibold truncate">{item.label}</span>
            ) : item.path ? (
              <Link to={item.path} className="hover:text-nexus-primary transition-colors truncate">
                {item.label}
              </Link>
            ) : (
              <span className="truncate">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
