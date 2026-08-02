import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positions = {
    right: 'inset-y-0 right-0 h-full w-full sm:max-w-md border-l animate-in slide-in-from-right',
    left: 'inset-y-0 left-0 h-full w-full sm:max-w-md border-r animate-in slide-in-from-left',
    bottom: 'bottom-0 inset-x-0 w-full h-[60vh] border-t animate-in slide-in-from-bottom',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Body */}
      <div className={`absolute bg-nexus-card border-nexus-border shadow-xl flex flex-col z-10 transition-transform duration-300 ${positions[position]} ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
          <h2 className="text-base font-bold text-nexus-heading">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-nexus-muted hover:bg-nexus-surface transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-nexus-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
