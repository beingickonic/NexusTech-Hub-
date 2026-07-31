import React, { useState } from 'react';
import { Download, FileText, CreditCard, Receipt, TrendingUp, Loader2 } from 'lucide-react';
import { financeService } from '../../services/financeService';

const ReportCard = ({ title, description, icon: Icon, onExport, loading }) => (
  <div className="bg-white/10 dark:bg-nexus-card backdrop-blur-lg border border-white/20 dark:border-nexus-border/50 p-6 rounded-2xl shadow-xl flex flex-col items-start">
    <div className="p-3 bg-nexus-error/20 text-nexus-error rounded-xl mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-nexus-heading mb-2">{title}</h3>
    <p className="text-nexus-muted text-sm mb-6 flex-1">{description}</p>
    <div className="flex w-full">
      <button 
        onClick={() => onExport('csv')}
        disabled={loading}
        className="w-full bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-border text-nexus-text px-3 py-2 rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
        Export CSV
      </button>
    </div>
  </div>
);

const ReportsPage = () => {
  const [exporting, setExporting] = useState(null);

  const downloadCSV = (data, filename) => {
    if (!data || !data.length) return alert('No data to export');
    
    // Flatten nested objects and extract headers
    const flattenObj = (ob) => {
      let result = {};
      for (const i in ob) {
        if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i]) && ob[i] !== null) {
          const temp = flattenObj(ob[i]);
          for (const j in temp) {
            result[i + '_' + j] = temp[j];
          }
        } else {
          result[i] = ob[i];
        }
      }
      return result;
    };

    const flatData = data.map(flattenObj);
    const headers = Object.keys(flatData[0]);
    const csvContent = [
      headers.join(','),
      ...flatData.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExport = async (type) => {
    try {
      setExporting(type);
      let data = [];
      let filename = type;

      switch(type) {
        case 'revenue':
          data = await financeService.getInvoices();
          data = data.filter(inv => inv.status === 'Paid');
          filename = 'Revenue_Report';
          break;
        case 'expenses':
          data = await financeService.getExpenses();
          filename = 'Expense_Report';
          break;
        case 'invoices':
          data = await financeService.getInvoices();
          filename = 'Invoice_Report';
          break;
        case 'payments':
          data = await financeService.getPayments();
          filename = 'Payment_Report';
          break;
        default:
          break;
      }

      downloadCSV(data, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to generate report');
    } finally {
      setExporting(null);
    }
  };
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-nexus-heading">Reports</h1>
        <p className="text-nexus-textSecondary mt-1">Generate and export financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Revenue Report" 
          description="Detailed breakdown of all recognized revenue from paid invoices."
          icon={TrendingUp} 
          onExport={() => handleExport('revenue')}
          loading={exporting === 'revenue'}
        />
        <ReportCard 
          title="Expense Report" 
          description="Comprehensive list of all business expenses categorized by vendor and type."
          icon={Receipt} 
          onExport={() => handleExport('expenses')}
          loading={exporting === 'expenses'}
        />
        <ReportCard 
          title="Invoice Report" 
          description="Status of all issued invoices, including outstanding and overdue accounts."
          icon={FileText} 
          onExport={() => handleExport('invoices')}
          loading={exporting === 'invoices'}
        />
        <ReportCard 
          title="Payment Report" 
          description="Log of all received payments, categorized by payment method and date."
          icon={CreditCard} 
          onExport={() => handleExport('payments')}
          loading={exporting === 'payments'}
        />
      </div>
      
      <div className="bg-white/10 dark:bg-nexus-card backdrop-blur-lg border border-white/20 dark:border-nexus-border/50 p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-bold text-nexus-heading mb-2">Advanced Reports</h2>
        <p className="text-nexus-textSecondary max-w-2xl mx-auto">
          Phase 2 will introduce Profit & Loss, Balance Sheet, Trial Balance, and Cash Flow Statements.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
