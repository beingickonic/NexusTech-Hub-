import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className={`relative bg-nexus-card rounded-xl border border-nexus-border shadow-xl max-w-lg w-full flex flex-col max-h-[85vh] z-10 transition-all duration-300 animate-in fade-in-50 zoom-in-95 ${className}`}>
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

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-nexus-border bg-nexus-surface/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
