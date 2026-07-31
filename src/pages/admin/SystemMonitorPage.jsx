import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Users,
  UserPlus,
  Search,
  RefreshCw,
  ShoppingCart,
  Package,
  Truck,
  Wallet,
  MapPin,
  Boxes,
  ShieldCheck,
  Clock,
  Radio,
  LogIn,
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { auditService } from '../../services/auditService';

const ROLE_META = {
  Admin: { label: 'Admin', color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20' },
  super_admin: { label: 'Super Admin', color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20' },
  Manager: { label: 'Manager', color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20' },
  Finance_Manager: { label: 'Finance Manager', color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20' },
  Finance_Officer: { label: 'Finance Officer', color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20' },
  Dispatch_Officer: { label: 'Dispatch', color: 'bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/20' },
  Driver: { label: 'Driver', color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  Warehouse_Staff: { label: 'Warehouse', color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20' },
  Supplier: { label: 'Supplier', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  Customer: { label: 'Customer', color: 'bg-nexus-muted/10 text-nexus-textSecondary' },
};

const ROLE_ICONS = {
  Admin: ShieldCheck,
  Finance_Manager: Wallet,
  Finance_Officer: Wallet,
  Dispatch_Officer: MapPin,
  Driver: Truck,
  Warehouse_Staff: Boxes,
  Supplier: Truck,
  Customer: UserPlus,
};

const ENTITY_META = {
  order: { Icon: ShoppingCart, cls: 'bg-nexus-info/10 text-nexus-info' },
  product: { Icon: Package, cls: 'bg-nexus-primary/10 text-nexus-primary' },
  inventory: { Icon: Boxes, cls: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  payment: { Icon: Wallet, cls: 'bg-nexus-success/10 text-nexus-success' },
  supplier: { Icon: Truck, cls: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  dispatch: { Icon: MapPin, cls: 'bg-nexus-primary/10 text-nexus-primary' },
  driver: { Icon: Truck, cls: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  user: { Icon: UserPlus, cls: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20' },
  profile: { Icon: UserPlus, cls: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20' },
};

const ACTION_LABELS = {
  created: 'Created',
  status_update: 'Status updated',
  payment_verified: 'Payment verified',
  updated: 'Updated',
  deleted: 'Deleted',
  login: 'Signed in',
  logout: 'Signed out',
  stock_update: 'Stock updated',
  reserved: 'Stock reserved',
  assigned: 'Assigned',
};

const ENTITY_LABELS = {
  order: 'Order',
  product: 'Product',
  inventory: 'Inventory',
  payment: 'Payment',
  supplier: 'Supplier',
  dispatch: 'Dispatch',
  driver: 'Driver',
  user: 'User',
  profile: 'User',
};

const DEFAULT_ENTITY = { Icon: Activity, cls: 'bg-nexus-muted/10 text-nexus-textSecondary' };

const roleLabel = (role) => ROLE_META[role]?.label || role || 'Unknown';
const roleColor = (role) => ROLE_META[role]?.color || 'bg-nexus-muted/10 text-nexus-textSecondary';
const actionLabel = (action) => ACTION_LABELS[action] || String(action || 'action').replace(/_/g, ' ');
const entityLabel = (type) => ENTITY_LABELS[type] || String(type || 'system');

const getRelativeTime = (dateStr, now = Date.now()) => {
  if (!dateStr) return 'Just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = new Date(dateStr) - now;
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);

  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour');
  return rtf.format(days, 'day');
};

const getPresence = (lastActivity, now = Date.now()) => {
  if (!lastActivity) return { label: 'No activity', dot: 'bg-nexus-muted' };
  const diff = now - new Date(lastActivity).getTime();
  if (diff < 15 * 60 * 1000) return { label: 'Active now', dot: 'bg-emerald-500' };
  if (diff < 24 * 60 * 60 * 1000) return { label: 'Active today', dot: 'bg-nexus-gold' };
  return { label: 'Idle', dot: 'bg-nexus-muted' };
};

const StatCard = ({ icon: Icon, label, value, tone = 'text-nexus-heading', iconCls = 'bg-nexus-primary/10 text-nexus-primary' }) => (
  <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-lg ${iconCls}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wider truncate">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${tone}`}>{value}</p>
    </div>
  </div>
);

const Card = ({ title, subtitle, icon: Icon, children, actions, className = '' }) => (
  <div className={`bg-nexus-card rounded-xl md:rounded-2xl border border-nexus-border shadow-sm flex flex-col overflow-hidden ${className}`}>
    <div className="flex items-center justify-between gap-2 px-4 md:px-5 pt-4 md:pt-5 pb-3 border-b border-nexus-border">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon size={17} className="text-nexus-primary flex-shrink-0" />}
        <div className="min-w-0">
          <h3 className="text-sm md:text-base font-bold text-nexus-heading leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-[11px] text-nexus-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
    <div className="flex-1 p-4 md:p-5">{children}</div>
  </div>
);

export default function SystemMonitorPage() {
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [authInfo, setAuthInfo] = useState({ loginById: {}, emailById: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [live, setLive] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [profRes, logRes, orderRes, authRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, role, department, status, created_at')
          .order('created_at', { ascending: false }),
        auditService.queryLogs({ limit: 300 }).catch(() => []),
        supabase.from('orders').select('id, created_at', { count: 'exact', head: true }),
        supabase.functions.invoke('admin-users'),
      ]);

      if (profRes.error) throw profRes.error;
      setProfiles(profRes.data || []);
      setLogs(logRes || []);
      setOrderCount(orderRes.count ?? 0);

      const authUsers = authRes.error ? [] : (authRes.data?.customers || []);
      const loginById = {};
      const emailById = {};
      authUsers.forEach((u) => {
        loginById[u.id] = u.last_sign_in_at || null;
        emailById[u.id] = u.email || null;
      });
      setAuthInfo({ loginById, emailById });
    } catch (err) {
      console.error('System monitor failed to load', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('system-monitor-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev].slice(0, 300));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAll())
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    const refreshInterval = setInterval(fetchAll, 30000);
    const clock = setInterval(() => setNow(Date.now()), 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
      clearInterval(clock);
    };
  }, [fetchAll]);

  const profileNameById = useMemo(() => {
    const map = {};
    profiles.forEach((p) => {
      map[p.id] = p.full_name || null;
    });
    return map;
  }, [profiles]);

  const activityByUser = useMemo(() => {
    const byUser = {};
    logs.forEach((log) => {
      if (!log.user_id) return;
      const entry = byUser[log.user_id] || {
        user_id: log.user_id,
        last_activity: null,
        action_count: 0,
      };
      entry.action_count += 1;
      if (!entry.last_activity || new Date(log.created_at) > new Date(entry.last_activity)) {
        entry.last_activity = log.created_at;
      }
      byUser[log.user_id] = entry;
    });
    return byUser;
  }, [logs]);

  const staffCount = useMemo(() => profiles.filter((p) => p.role !== 'Customer').length, [profiles]);

  const todayActivity = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return logs.filter((log) => new Date(log.created_at) >= start).length;
  }, [logs]);

  const loggedIn24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return profiles.filter((p) => {
      const last = authInfo.loginById[p.id];
      return last && new Date(last).getTime() >= cutoff;
    }).length;
  }, [profiles, authInfo]);

  const roleCounts = useMemo(() => {
    const counts = {};
    profiles.forEach((p) => {
      const key = p.role || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [profiles]);

  const entityBreakdown = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const key = log.entity_type || 'system';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const actionBreakdown = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const key = log.action || 'action';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const maxEntityCount = useMemo(() => Math.max(1, ...entityBreakdown.map(([, c]) => c)), [entityBreakdown]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (!term) return true;
      return (p.full_name || '').toLowerCase().includes(term);
    });
  }, [profiles, search, roleFilter]);

  const profileRoleById = useMemo(() => {
    const map = {};
    profiles.forEach((p) => {
      map[p.id] = p.role;
    });
    return map;
  }, [profiles]);

  const visibleLogs = useMemo(() => {
    if (roleFilter === 'all') return logs;
    return logs.filter((log) => log.user_id && profileRoleById[log.user_id] === roleFilter);
  }, [logs, roleFilter, profileRoleById]);

  const maxBar = useMemo(() => Math.max(1, ...Object.values(roleCounts)), [roleCounts]);

  const roleOptions = useMemo(() => {
    const keys = Object.keys(roleCounts);
    if (keys.includes('Customer') || keys.includes('Admin') || keys.includes('Dispatch_Officer')) {
      const order = ['Admin', 'Finance_Manager', 'Finance_Officer', 'Dispatch_Officer', 'Warehouse_Staff', 'Driver', 'Supplier', 'Customer'];
      return [...order.filter((r) => keys.includes(r)), ...keys.filter((r) => !order.includes(r))];
    }
    return keys;
  }, [roleCounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-nexus-heading flex items-center gap-2.5">
            <Activity size={22} className="text-nexus-primary" /> System Monitor
          </h1>
          <p className="text-sm text-nexus-muted mt-1">Track users, roles, and live activity across the entire system</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${live ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-nexus-muted/10 text-nexus-muted'}`}>
            <Radio size={13} className={live ? 'animate-pulse' : ''} />
            {live ? 'Live' : 'Offline'}
          </span>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-surface"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard icon={Users} label="Total users" value={profiles.length} />
        <StatCard icon={UserPlus} label="Customers" value={roleCounts.Customer || 0} iconCls="bg-nexus-muted/10 text-nexus-textSecondary" />
        <StatCard icon={ShieldCheck} label="Staff" value={staffCount} iconCls="bg-nexus-gold/10 text-nexus-gold" />
        <StatCard icon={LogIn} label="Logged in 24h" value={loggedIn24h} iconCls="bg-nexus-info/10 text-nexus-info" />
        <StatCard icon={ShoppingCart} label="Orders" value={orderCount} iconCls="bg-nexus-primary/10 text-nexus-primary" />
        <StatCard icon={Clock} label="Today's actions" value={todayActivity} iconCls="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Users + Live feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card
          title="Users Monitor"
          subtitle={`${filteredProfiles.length} of ${profiles.length} users`}
          icon={Users}
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-nexus-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-nexus-border bg-transparent text-nexus-heading placeholder:text-nexus-muted focus:outline-none focus:ring-2 focus:ring-nexus-primary/40 w-40 md:w-48"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-nexus-border bg-nexus-card text-nexus-heading focus:outline-none focus:ring-2 focus:ring-nexus-primary/40"
              >
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{roleLabel(role)}</option>
                ))}
              </select>
            </div>
          }
        >
          <div className="max-h-[460px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-nexus-card z-10">
                <tr className="text-left text-[11px] uppercase tracking-wider text-nexus-muted border-b border-nexus-border">
                  <th className="pb-2.5 pr-3 font-semibold">User</th>
                  <th className="pb-2.5 pr-3 font-semibold hidden md:table-cell">Role</th>
                  <th className="pb-2.5 pr-3 font-semibold hidden sm:table-cell">Status</th>
                  <th className="pb-2.5 pr-3 font-semibold hidden sm:table-cell">Last login</th>
                  <th className="pb-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-nexus-muted">No users match your filters.</td>
                  </tr>
                )}
                {filteredProfiles.map((profile) => {
                  const act = activityByUser[profile.id];
                  const lastSignIn = authInfo.loginById[profile.id];
                  const lastActivity = act?.last_activity;
                  const effectiveLast = (() => {
                    if (!lastSignIn) return lastActivity;
                    if (!lastActivity) return lastSignIn;
                    return new Date(lastActivity) > new Date(lastSignIn) ? lastActivity : lastSignIn;
                  })();
                  const presence = getPresence(effectiveLast, now);
                  const RoleIcon = ROLE_ICONS[profile.role];
                  return (
                    <tr key={profile.id} className="border-b border-nexus-border/50 last:border-0">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleColor(profile.role)}`}>
                            {(profile.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-nexus-heading truncate">{profile.full_name || 'Unnamed user'}</p>
                            <p className="text-[11px] text-nexus-muted truncate">
                              {authInfo.emailById[profile.id] || profile.department || '—'}
                              <span className="md:hidden"> · {roleLabel(profile.role)}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${roleColor(profile.role)}`}>
                          {RoleIcon && <RoleIcon size={11} />}
                          {roleLabel(profile.role)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-nexus-textSecondary">
                          <span className={`w-1.5 h-1.5 rounded-full ${presence.dot}`} />
                          {presence.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3 hidden sm:table-cell text-xs text-nexus-muted whitespace-nowrap">
                        {lastSignIn ? getRelativeTime(lastSignIn, now) : 'Never'}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-nexus-surface dark:bg-nexus-hover/50 text-xs font-semibold text-nexus-heading">
                          {act?.action_count || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Live Activity"
          subtitle={`${visibleLogs.length} recent system actions`}
          icon={Radio}
          actions={
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${live ? 'text-emerald-500' : 'text-nexus-muted'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-nexus-muted'}`} />
              {live ? 'Streaming' : 'Polling'}
            </span>
          }
        >
          <div className="max-h-[460px] overflow-y-auto pr-1 space-y-1">
            {visibleLogs.length === 0 && (
              <p className="py-10 text-center text-sm text-nexus-muted">No activity recorded yet.</p>
            )}
            {visibleLogs.slice(0, 50).map((log) => {
              const entity = ENTITY_META[log.entity_type] || DEFAULT_ENTITY;
              const { Icon, cls } = entity;
              const name = log.user_name || profileNameById[log.user_id] || 'System';
              return (
                <div key={log.id} className="flex gap-3 py-2.5 border-b border-nexus-border/40 last:border-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${cls}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-nexus-heading leading-snug">
                      <span className="font-semibold">{name}</span>
                      <span className="text-nexus-muted"> {actionLabel(log.action)}</span>
                      <span className="font-semibold text-nexus-primary"> {entityLabel(log.entity_type)}</span>
                    </p>
                    {log.new_status && (
                      <p className="text-[11px] text-nexus-muted mt-0.5 truncate">
                        {log.old_status || '—'} → {log.new_status}
                      </p>
                    )}
                    <p className="text-[10px] text-nexus-muted mt-1">
                      {log.role ? <span className={`inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] font-semibold ${roleColor(log.role)}`}>{roleLabel(log.role)}</span> : null}
                      {getRelativeTime(log.created_at, now)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card title="User Distribution" subtitle="All accounts by role" icon={Users}>
          <div className="space-y-3">
            {roleOptions.map((role) => {
              const count = roleCounts[role] || 0;
              const pct = Math.round((count / Math.max(1, profiles.length)) * 100);
              const RoleIcon = ROLE_ICONS[role] || Users;
              return (
                <div key={role} className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold w-32 flex-shrink-0 ${roleColor(role)}`}>
                    <RoleIcon size={11} />
                    {roleLabel(role)}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-nexus-surface dark:bg-nexus-hover/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-nexus-primary to-nexus-gold transition-all duration-500"
                      style={{ width: `${(count / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-nexus-heading w-8 text-right">{count}</span>
                  <span className="text-[10px] text-nexus-muted w-9 text-right">{pct}%</span>
                </div>
              );
            })}
            {roleOptions.length === 0 && <p className="text-sm text-nexus-muted">No users found.</p>}
          </div>
        </Card>

        <Card title="Activity by Module" subtitle="Where actions happen most" icon={Activity}>
          <div className="space-y-3">
            {entityBreakdown.map(([type, count]) => {
              const { Icon, cls } = ENTITY_META[type] || DEFAULT_ENTITY;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-md ${cls}`}>
                    <Icon size={13} />
                  </span>
                  <span className="text-sm font-medium text-nexus-heading capitalize flex-1">{entityLabel(type)}</span>
                  <div className="w-24 h-2 rounded-full bg-nexus-surface dark:bg-nexus-hover/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-nexus-primary transition-all duration-500"
                      style={{ width: `${(count / maxEntityCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-nexus-heading w-8 text-right">{count}</span>
                </div>
              );
            })}
            {entityBreakdown.length === 0 && <p className="text-sm text-nexus-muted">No activity recorded.</p>}
          </div>
        </Card>

        <Card title="Actions Performed" subtitle="Recent action types" icon={Activity}>
          <div className="space-y-3">
            {actionBreakdown.map(([action, count]) => (
              <div key={action} className="flex items-center gap-3">
                <span className="text-sm font-medium text-nexus-heading capitalize flex-1 truncate">{actionLabel(action)}</span>
                <div className="w-24 h-2 rounded-full bg-nexus-surface dark:bg-nexus-hover/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-nexus-gold transition-all duration-500"
                    style={{ width: `${(count / Math.max(1, ...actionBreakdown.map(([, c]) => c))) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-nexus-heading w-8 text-right">{count}</span>
              </div>
            ))}
            {actionBreakdown.length === 0 && <p className="text-sm text-nexus-muted">No activity recorded.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
