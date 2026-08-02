import React, { useState } from 'react';

export const Tooltip = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [active, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && content && (
        <div
          className={`absolute z-[999] px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded shadow-md whitespace-nowrap pointer-events-none transition-opacity duration-200 ${positions[position]} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
