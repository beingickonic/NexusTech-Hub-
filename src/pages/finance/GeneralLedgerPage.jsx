import React, { useState, useEffect } from 'react';
import { BookOpen, Search, RefreshCw, FileText, CheckCircle2, XCircle, Plus, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import { useAuth } from '../../auth/AuthContext';
import toast from 'react-hot-toast';

const GeneralLedgerPage = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    reference_number: `JE-${Date.now().toString().slice(-6)}`,
    source_module: 'Manual',
    description: '',
    posting_date: new Date().toISOString().split('T')[0]
  });
  const [lines, setLines] = useState([
    { account_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', debit: 0, credit: 0, description: '' }
  ]);

  useEffect(() => {
    fetchJournals();
  }, [statusFilter]);

  const fetchJournals = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.ledger.getJournalEntries(1, { status: statusFilter, search: filter });
    if (!error && data) {
      setJournals(data);
    } else {
      toast.error('Failed to load Journal Entries');
    }
    setLoading(false);
  };

  const fetchAccountsForDropdown = async () => {
    const { data, error } = await financeErpService.accounts.getChartOfAccounts(1, { isActive: true });
    if (!error && data) {
      setAccounts(data);
    }
  };

  const handleOpenAdd = () => {
    fetchAccountsForDropdown();
    setShowAddModal(true);
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    
    // Auto-zero opposite side
    if (field === 'debit' && value > 0) newLines[index].credit = 0;
    if (field === 'credit' && value > 0) newLines[index].debit = 0;
    
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate balance
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    
    if (totalDebit === 0 && totalCredit === 0) {
      return toast.error('Journal entry cannot be zero');
    }
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return toast.error(`Entry must balance! Debits: ${totalDebit} | Credits: ${totalCredit}`);
    }

    // Validate accounts
    if (lines.some(l => !l.account_id)) {
      return toast.error('All lines must have an account selected');
    }

    setSubmitting(true);
    
    const entryData = {
      ...formData,
      created_by: user.id,
      status: 'Pending Approval'
    };
    
    const { error } = await financeErpService.ledger.createJournalEntry(entryData, lines);
    
    if (!error) {
      toast.success('Journal Entry created and pending approval');
      setShowAddModal(false);
      setFormData({
        reference_number: `JE-${Date.now().toString().slice(-6)}`,
        source_module: 'Manual',
        description: '',
        posting_date: new Date().toISOString().split('T')[0]
      });
      setLines([
        { account_id: '', debit: 0, credit: 0, description: '' },
        { account_id: '', debit: 0, credit: 0, description: '' }
      ]);
      fetchJournals();
    } else {
      toast.error('Failed to create journal entry');
    }
    setSubmitting(false);
  };

  const handleApprove = async (id) => {
    const loadingToast = toast.loading('Posting journal entry...');
    const { error } = await financeErpService.ledger.updateJournalStatus(id, 'Posted', user.id);
    if (!error) {
      toast.success('Journal Posted Successfully', { id: loadingToast });
      fetchJournals();
    } else {
      toast.error('Failed to post journal', { id: loadingToast });
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">General Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage journal entries and view posting history.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          New Journal Entry
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchJournals(); }} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search reference number..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white"
              />
            </form>
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="Posted">Posted</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Draft">Draft</option>
                <option value="Reversed">Reversed</option>
              </select>
              <button 
                onClick={fetchJournals}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="animate-spin" size={24} />
                      Loading journals...
                    </div>
                  </td>
                </tr>
              ) : journals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No journal entries found.</p>
                  </td>
                </tr>
              ) : (
                journals.map((journal) => (
                  <tr key={journal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(journal.posting_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-slate-900 dark:text-white font-medium">
                        {journal.reference_number}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{journal.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {journal.source_module}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {journal.created_by_profile?.first_name} {journal.created_by_profile?.last_name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        journal.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        journal.status === 'Pending Approval' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        journal.status === 'Reversed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {journal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {journal.status === 'Pending Approval' && (
                        <button 
                          onClick={() => handleApprove(journal.id)}
                          className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Approve & Post
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Journal Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-700 my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={20} className="text-blue-500" />
                New Journal Entry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-500">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Number</label>
                  <input 
                    type="text" 
                    required
                    value={formData.reference_number}
                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Posting Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.posting_date}
                    onChange={(e) => setFormData({...formData, posting_date: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Memo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="Brief description of this entry..."
                  />
                </div>
              </div>

              {/* Journal Lines */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Entry Lines</h4>
                
                <div className="space-y-3">
                  {lines.map((line, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                      <div className="flex-1 w-full">
                        <select 
                          required
                          value={line.account_id}
                          onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
                        >
                          <option value="">Select Account...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-48">
                        <input 
                          type="text"
                          placeholder="Description (optional)"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm"
                        />
                      </div>
                      <div className="w-full md:w-32 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">DR</span>
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={line.debit}
                          onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm text-right"
                        />
                      </div>
                      <div className="w-full md:w-32 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">CR</span>
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={line.credit}
                          onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm text-right"
                        />
                      </div>
                      {lines.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={16} /> Add Line
                  </button>
                  
                  <div className="flex gap-6 text-sm font-bold">
                    <div className="text-slate-600 dark:text-slate-400">
                      Total Debit: <span className="text-slate-900 dark:text-white ml-2">
                        {lines.reduce((sum, line) => sum + Number(line.debit || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Total Credit: <span className="text-slate-900 dark:text-white ml-2">
                        {lines.reduce((sum, line) => sum + Number(line.credit || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 font-medium"
                >
                  {submitting ? <RefreshCw size={18} className="animate-spin" /> : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLedgerPage;
