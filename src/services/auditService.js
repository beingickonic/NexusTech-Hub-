import { supabase } from './supabaseClient';

const mapRow = (row) => ({
  ...row,
  user_name: row.user_name || row.profiles?.full_name || null,
  user_email: row.user_email || null,
  user_role: row.user_role || row.profiles?.role || row.role || null,
});

const queryDirect = async ({ entityType, entityId, action, userId, fromDate, toDate, limit = 100, offset = 0 } = {}) => {
  let query = supabase
    .from('audit_logs')
    .select('*, profiles(full_name, role, department)')
    .order('created_at', { ascending: false })
    .range(offset, Math.max(offset + limit - 1, offset));

  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);
  if (action) query = query.eq('action', action);
  if (userId) query = query.eq('user_id', userId);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapRow);
};

let rpcUsable = true;

export const auditService = {
  queryLogs: async (filters = {}) => {
    if (rpcUsable) {
      try {
        const { data, error } = await supabase.rpc('query_audit_logs', {
          p_entity_type: filters.entityType || null,
          p_entity_id: filters.entityId || null,
          p_action: filters.action || null,
          p_user_id: filters.userId || null,
          p_from_date: filters.fromDate || null,
          p_to_date: filters.toDate || null,
          p_limit: filters.limit || 100,
          p_offset: filters.offset || 0,
        });
        if (error) throw error;
        return (data || []).map(mapRow);
      } catch {
        rpcUsable = false;
      }
    }
    return queryDirect(filters);
  },

  getOrderAudit: async (orderId) => {
    return auditService.queryLogs({ entityType: 'order', entityId: orderId });
  },

  getUserAudit: async (userId) => {
    return auditService.queryLogs({ userId });
  },

  getRecentLogs: async (limit = 50) => {
    return auditService.queryLogs({ limit });
  },

  getUserActivity: async (limit = 300) => {
    const logs = await auditService.queryLogs({ limit });
    const byUser = {};

    for (const log of logs) {
      if (!log.user_id) continue;
      const entry = byUser[log.user_id];
      if (!entry) {
        byUser[log.user_id] = {
          user_id: log.user_id,
          user_name: log.user_name,
          user_role: log.user_role,
          last_activity: log.created_at,
          action_count: 0,
          actions: {},
        };
      }
      const target = byUser[log.user_id];
      target.action_count += 1;
      const action = log.action || 'unknown';
      target.actions[action] = (target.actions[action] || 0) + 1;
      if (!target.last_activity || new Date(log.created_at) > new Date(target.last_activity)) {
        target.last_activity = log.created_at;
      }
    }

    return Object.values(byUser);
  },

  getDepartmentSummary: async () => {
    const logs = await auditService.queryLogs({ limit: 1000 }).catch(() => []);
    const deptCounts = {};

    (logs || []).forEach((log) => {
      const dept = log.department || 'other';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    return deptCounts;
  },
};
