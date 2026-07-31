import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OfficeDataTable = ({ 
  title, 
  description, 
  columns, 
  data, 
  isLoading, 
  onAdd, 
  onEdit, 
  onDelete,
  searchPlaceholder = "Search..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple client-side search across all columns
  const filteredData = data?.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexus-heading mb-2">{title}</h1>
        <p className="text-nexus-muted">{description}</p>
      </div>

      <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-nexus-border">
          <div className="relative w-full sm:max-w-md flex items-center">
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
            />
            <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto">
              <Filter size={16} /> Filter
            </button>
            {onAdd && (
              <button 
                onClick={onAdd}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/30 w-full sm:w-auto"
              >
                <Plus size={16} /> Add New
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4">{col.header}</th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-nexus-textSecondary">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-nexus-muted">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 font-medium text-nexus-heading">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(row)} 
                              className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => {
                                if(window.confirm('Are you sure you want to delete this record?')) {
                                  onDelete(row.id);
                                }
                              }} 
                              className="p-2 text-nexus-textSecondary hover:text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-muted">
          <div>Showing {filteredData.length} records</div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDataTable;
