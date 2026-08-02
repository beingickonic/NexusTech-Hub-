import React, { useState, useEffect, useRef } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const alignments = {
    left: 'left-0 mt-2',
    right: 'right-0 mt-2',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 w-56 rounded-xl border border-nexus-border bg-nexus-card shadow-lg ring-1 ring-black/5 focus:outline-none py-1.5 animate-in fade-in-50 zoom-in-95 ${alignments[align]} ${className}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm text-nexus-heading hover:bg-nexus-surface transition-colors flex items-center gap-2.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Dropdown;
