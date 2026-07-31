import React, { useState } from 'react';
import { Search, Filter, Upload, Download, Folder, FileText, Archive } from 'lucide-react';

const Records = () => {
  const [activeTab, setActiveTab] = useState('Employee Records');
  const tabs = ['Employee Records', 'Supplier Records', 'Customer Records', 'Company Documents', 'Policies', 'Contracts', 'Licenses', 'Certificates'];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">HQ Records Center</h1>
          <p className="text-sm text-nexus-textSecondary">Manage and archive official company documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary rounded-xl text-sm font-medium transition-colors">
            <Upload size={16} /> Upload Record
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl shadow-sm">
        <div className="border-b border-nexus-border overflow-x-auto">
          <div className="flex px-4 py-2 space-x-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-nexus-primary text-white' 
                    : 'text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-nexus-textSecondary mb-3" />
            <h3 className="text-sm font-medium text-nexus-heading">No {activeTab.toLowerCase()} found</h3>
            <p className="text-sm text-nexus-textSecondary mt-1">Get started by uploading a new record.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;
