import React from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (n) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={`rounded-full object-cover border border-nexus-border ${sizes[size]} ${className}`}
      {...props}
    />
  ) : (
    <div
      className={`rounded-full bg-nexus-primary/10 text-nexus-primary border border-nexus-primary/20 flex items-center justify-center font-bold select-none ${sizes[size]} ${className}`}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
