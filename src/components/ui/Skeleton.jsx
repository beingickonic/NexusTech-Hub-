import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'text',
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`animate-pulse bg-nexus-surface dark:bg-nexus-surface/50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
