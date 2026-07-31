import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, CheckCircle2, Activity } from 'lucide-react';
import { failureService } from '../../services/failureService';

const SEVERITY_STYLES = {
  critical: 'bg-nexus-error/10 dark:bg-nexus-error/30 text-nexus-error',
  error: 'bg-nexus-primary/15 dark:bg-nexus-primary/30 text-nexus-primary',
  warning: 'bg-nexus-gold/10 dark:bg-nexus-gold/30 text-nexus-gold',
  debug: 'bg-nexus-surface text-nexus-muted',
};

const STATUS_STYLES = {
  unresolved: 'bg-nexus-error/10 dark:bg-nexus-error/30 text-nexus-error',
  retrying: 'bg-nexus-info/10 dark:bg-nexus-info/30 text-nexus-info',
  resolved: 'bg-nexus-success/10 dark:bg-nexus-success/30 text-nexus-success dark:text-nexus-success',
  ignored: 'bg-nexus-surface text-nexus-muted',
};

export default function FailureMonitorPage() {
  const [failures, setFailures] = useState([]);
  const [retryQueue, setRetryQueue] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('unresolved');
  const [note, setNote] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, rq, s] = await Promise.all([
        failureService.getFailures({ status: statusFilter === 'all' ? null : statusFilter }).catch(() => []),
        failureService.getRetryQueue().catch(() => []),
        failureService.getFailureSummary().catch(() => []),
      ]);
      setFailures(f); setRetryQueue(rq); setSummary(s);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRetry = async (id) => {
    try { await failureService.retryOperation(id); fetchAll(); } catch {}
  };

  const handleResolve = async (id) => {
    try { await failureService.resolveFailure(id, note || 'Manually resolved'); fetchAll(); } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-nexus-heading flex items-center gap-2">
            <AlertTriangle size={20} className="text-nexus-error" /> Failure Monitor
          </h1>
          <p className="text-sm text-nexus-textSecondary mt-0.5">Dead letter queue, retries, and system health</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-surface">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.slice(0, 8).map((s, i) => (
            <div key={i} className="bg-nexus-card rounded-xl border border-nexus-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wider">{s.entity_type}</span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${SEVERITY_STYLES[s.severity] || SEVERITY_STYLES.debug}`}>{s.severity}</span>
              </div>
              <p className="text-2xl font-bold text-nexus-heading mt-2">{s.count}</p>
              <p className={`text-[10px] font-medium ${STATUS_STYLES[s.status]?.split(' ')[0]}`}>{s.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Retry queue */}
      {retryQueue.length > 0 && (
        <div className="bg-nexus-card rounded-xl border border-nexus-border overflow-hidden">
          <div className="px-4 py-3 border-b border-nexus-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-nexus-heading flex items-center gap-2">
              <Activity size={15} className="text-nexus-info" /> Pending Retries ({retryQueue.length})
            </h2>
          </div>
          <div className="divide-y divide-nexus-border dark:divide-nexus-card">
            {retryQueue.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-nexus-heading truncate">
                    {item.operation} <span className="text-nexus-textSecondary">on</span> {item.entity_type}
                  </p>
                  <p className="text-xs text-nexus-textSecondary">Attempt {item.attempts}/{item.max_retries}</p>
                </div>
                <button onClick={() => handleRetry(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-nexus-info/10 dark:bg-nexus-info/30 text-nexus-info hover:bg-nexus-info/20 dark:hover:bg-nexus-info/50">
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['unresolved', 'retrying', 'resolved', 'all'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${statusFilter === s ? 'bg-nexus-heading dark:bg-white text-white dark:text-nexus-navy border-nexus-heading dark:border-nexus-navy' : 'border-nexus-border text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-surface'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Failure list */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : failures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-nexus-textSecondary">
          <AlertTriangle size={40} className="opacity-40 mb-3" />
          <p className="font-medium">No failures {statusFilter !== 'all' ? `(${statusFilter})` : ''}</p>
        </div>
      ) : (
        <div className="bg-nexus-card rounded-xl border border-nexus-border overflow-hidden">
          <div className="divide-y divide-nexus-border dark:divide-nexus-card">
            {failures.map(f => (
              <div key={f.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${SEVERITY_STYLES[f.severity]}`}>{f.severity}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${STATUS_STYLES[f.status]}`}>{f.status}</span>
                      <span className="text-sm font-medium text-nexus-heading">{f.operation}</span>
                    </div>
                    <p className="text-xs text-nexus-textSecondary mt-1 truncate">{f.entity_type} {f.entity_id ? `#${f.entity_id.slice(0, 8)}` : ''}</p>
                    {f.error_message && <p className="text-xs text-nexus-error dark:text-nexus-error mt-1 line-clamp-2">{f.error_message}</p>}
                    <p className="text-[10px] text-nexus-textSecondary mt-1">{new Date(f.created_at).toLocaleString()} · Retries {f.retry_count}/{f.max_retries}</p>
                  </div>
                  {f.status === 'unresolved' && (
                    <button onClick={() => handleResolve(f.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-nexus-success/10 dark:bg-nexus-success/30 text-nexus-success dark:text-nexus-success hover:bg-nexus-success/20 dark:hover:bg-nexus-success/50">
                      <CheckCircle2 size={12} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
