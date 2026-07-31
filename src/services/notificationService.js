import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';

export const notificationService = {
  // ── Native Push Notifications (Mobile) ──────────────────────────
  initializePushNotifications: async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') return false;

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ fcm_token: token.value }).eq('id', user.id);
      });
      PushNotifications.addListener('registrationError', (error) => {});
      PushNotifications.addListener('pushNotificationReceived', (notification) => {});
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {});

      return true;
    } catch (error) {
      return false;
    }
  },

  // ── Legacy Portal Notifications ─────────────────────────────────
  getPortalNotifications: async (userId, role) => {
    const { data, error } = await supabase
      .from('portal_notifications')
      .select('*')
      .or(`user_id.eq.${userId},target_role.eq.${role}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data: data || [] };
  },

  markAsRead: async (notificationId) => {
    const { error } = await supabase
      .from('portal_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return { success: true };
  },

  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('portal_notifications')
      .insert([notificationData])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  subscribeToPortalNotifications: (userId, role, callback) => {
    const channel = supabase
      .channel('erp-portal-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'portal_notifications'
      }, payload => {
        const n = payload.new;
        if (n.user_id === userId || n.target_role === role) {
          callback(n);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  // ── Unified Notification Logs (v2) ──────────────────────────────

  getNotifications: async ({ limit = 50, offset = 0, type } = {}) => {
    let query = supabase
      .from('notification_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getUnreadCount: async () => {
    const { data, error } = await supabase.rpc('get_unread_notification_count');
    if (error) throw error;
    return data || 0;
  },

  markLogAsRead: async (notificationIds) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    const { data, error } = await supabase.rpc('mark_notifications_read', { p_notification_ids: ids });
    if (error) throw error;
    return data;
  },

  subscribeToNotifications: (userId, callback) => {
    const channel = supabase
      .channel('notification-logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_logs',
        filter: `user_id=eq.${userId}`
      }, payload => callback(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
