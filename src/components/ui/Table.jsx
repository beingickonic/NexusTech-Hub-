import React from 'react';

export const Table = ({
  headers = [],
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-nexus-border bg-nexus-card ${className}`} {...props}>
      <table className="w-full border-collapse text-left text-sm text-nexus-text">
        <thead>
          <tr className="bg-nexus-surface/50 border-b border-nexus-border">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="text-nexus-heading font-semibold p-4 sticky top-0 backdrop-blur-sm z-10 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-nexus-border">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr
      className={`hover:bg-nexus-primary/5 dark:hover:bg-nexus-hover/5 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`p-4 align-middle whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  );
};

export default Table;
