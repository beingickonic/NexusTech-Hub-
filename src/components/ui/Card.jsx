import React from 'react';

export const Card = React.forwardRef(({
  className = '',
  children,
  hoverElevation = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-nexus-card rounded-xl shadow-soft border border-nexus-border transition-all duration-300 ${
        hoverElevation ? 'hover:shadow-card hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
