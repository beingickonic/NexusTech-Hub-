import { useState, useEffect } from 'react';

const UserAvatar = ({ src, name, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        className={`${currentSize} rounded-full object-cover ring-2 ring-[#FF6B57]/30 flex-shrink-0 ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${currentSize} rounded-full bg-gradient-to-br from-[#FF6B57] to-[#FF8C42] flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
