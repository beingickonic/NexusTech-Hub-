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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative w-full sm:max-w-md flex items-center">
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
            <Search size={18} className="absolute left-3 text-slate-400" />
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 w-full sm:w-auto">
              <Filter size={16} /> Filter
            </button>
            {onAdd && (
              <button 
                onClick={onAdd}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-orange-500/30 w-full sm:w-auto"
              >
                <Plus size={16} /> Add New
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4">{col.header}</th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(row)} 
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
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
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div>Showing {filteredData.length} records</div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDataTable;
