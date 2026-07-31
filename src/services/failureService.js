import { supabase } from './supabaseClient';

export const failureService = {
  logFailure: async ({ entityType, entityId, operation, errorMessage, errorDetail, severity = 'error', maxRetries = 3 }) => {
    const { data, error } = await supabase.rpc('log_failure', {
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_operation: operation,
      p_error_message: errorMessage,
      p_error_detail: errorDetail || null,
      p_severity: severity,
      p_max_retries: maxRetries,
    });
    if (error) throw error;
    return data;
  },

  retryOperation: async (retryQueueId) => {
    const { data, error } = await supabase.rpc('retry_operation', {
      p_retry_queue_id: retryQueueId,
    });
    if (error) throw error;
    return data;
  },

  resolveFailure: async (failureId, note) => {
    const { data, error } = await supabase.rpc('resolve_failure', {
      p_failure_id: failureId,
      p_resolution_note: note || null,
    });
    if (error) throw error;
    return data;
  },

  getFailureSummary: async () => {
    const { data, error } = await supabase.rpc('get_failure_summary');
    if (error) throw error;
    return data || [];
  },

  getFailures: async ({ status, severity, limit = 100 } = {}) => {
    let query = supabase.from('failure_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getRetryQueue: async () => {
    const { data, error } = await supabase.from('retry_queue').select('*, failure_logs(*)').is('acquired_at', null).order('scheduled_at').limit(50);
    if (error) throw error;
    return data || [];
  },
};
