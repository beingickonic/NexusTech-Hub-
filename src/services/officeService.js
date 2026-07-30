import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';

export const officeService = {
  // Tasks
  getTasks: async () => {
    const { data, error } = await supabase.from('office_tasks').select(`
      *,
      assigned_to:profiles!office_tasks_assigned_to_fkey(full_name, avatar_url),
      created_by:profiles!office_tasks_created_by_fkey(full_name)
    `).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },
  createTask: async (task) => {
    const { data, error } = await supabase.from('office_tasks').insert([task]).select();
    if (error) throw error;
    
    if (task.assigned_to_id) {
      await notificationService.createNotification({
        user_id: task.assigned_to_id,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        type: 'task',
        read_status: false
      }).catch(console.error);
    }
    return { success: true, data: data[0] };
  },
  updateTask: async (id, updates) => {
    const { data, error } = await supabase.from('office_tasks').update(updates).eq('id', id).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },
  deleteTask: async (id) => {
    const { error } = await supabase.from('office_tasks').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Announcements
  getAnnouncements: async () => {
    const { data, error } = await supabase.from('office_announcements').select(`
      *,
      created_by:profiles(full_name)
    `).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },
  createAnnouncement: async (announcement) => {
    const { data, error } = await supabase.from('office_announcements').insert([announcement]).select();
    if (error) throw error;
    
    // Broadcast notification (simulated by not passing a specific user_id, assuming portal_notifications supports system-wide or we create for all users)
    // For a real app we'd fetch users or trigger an Edge Function.
    
    return { success: true, data: data[0] };
  },
  deleteAnnouncement: async (id) => {
    const { error } = await supabase.from('office_announcements').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Meetings
  getMeetings: async () => {
    const { data, error } = await supabase.from('office_meetings').select('*').order('date', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  },
  createMeeting: async (meeting) => {
    const { data, error } = await supabase.from('office_meetings').insert([meeting]).select();
    if (error) throw error;
    
    // In a full implementation, loop through meeting.participants and create notifications
    
    return { success: true, data: data[0] };
  },

  // Supplies
  getSupplies: async () => {
    const { data, error } = await supabase.from('office_supplies').select('*').order('item_name');
    if (error) throw error;
    return { success: true, data };
  },
  createSupply: async (supply) => {
    const { data, error } = await supabase.from('office_supplies').insert([supply]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },
  updateSupply: async (id, updates) => {
    const { data, error } = await supabase.from('office_supplies').update(updates).eq('id', id).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },
  deleteSupply: async (id) => {
    const { error } = await supabase.from('office_supplies').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Messages
  getMessages: async (userId) => {
    const { data, error } = await supabase.from('office_messages')
      .select('*, sender:profiles!office_messages_sender_id_fkey(full_name)')
      .or(`receiver_id.eq.${userId},message_type.eq.broadcast`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  // Employees & Departments
  getDepartments: async () => {
    const { data, error } = await supabase.from('office_departments').select('*');
    if (error) throw error;
    return { success: true, data };
  },
  getEmployees: async () => {
    const { data, error } = await supabase.from('profiles').select(`
      *,
      department:office_departments(name)
    `).order('full_name');
    if (error) throw error;
    return { success: true, data };
  },

  // Documents
  getDocuments: async () => {
    const { data, error } = await supabase.from('office_documents').select('*, uploader:profiles!office_documents_uploaded_by_fkey(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },
  uploadDocument: async (file, metadata) => {
    const filePath = `documents/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('office_documents').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data, error: dbError } = await supabase.from('office_documents').insert([{
      ...metadata,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    }]).select();
    if (dbError) throw dbError;

    return { success: true, data: data[0] };
  },
  deleteDocument: async (id, filePath) => {
    await supabase.storage.from('office_documents').remove([filePath]);
    const { error } = await supabase.from('office_documents').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Support Requests
  getSupportRequests: async () => {
    const { data, error } = await supabase.from('office_support_requests').select(`
      *,
      assigned_to:profiles!office_support_requests_assigned_to_fkey(full_name),
      requested_by:profiles!office_support_requests_requested_by_fkey(full_name)
    `).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  // Visitors
  getVisitors: async () => {
    const { data, error } = await supabase.from('office_visitors').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  // Calls
  getCalls: async () => {
    const { data, error } = await supabase.from('office_calls').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  // Emails
  getEmails: async () => {
    const { data, error } = await supabase.from('office_emails').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const [tasksRes, meetingsRes, messagesRes, suppliesRes, visitorsRes, requestsRes] = await Promise.all([
      supabase.from('office_tasks').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('office_meetings').select('id', { count: 'exact', head: true }).gte('date', `${today}T00:00:00`).lt('date', `${today}T23:59:59`),
      supabase.from('office_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('office_supplies').select('id').then(res => {
        // Need to fetch to compare current_stock <= min_stock
        return supabase.from('office_supplies').select('*');
      }),
      supabase.from('office_visitors').select('id', { count: 'exact', head: true }).gte('expected_time', `${today}T00:00:00`).lt('expected_time', `${today}T23:59:59`),
      supabase.from('office_support_requests').select('id', { count: 'exact', head: true }).eq('status', 'Open')
    ]);

    const lowSuppliesCount = suppliesRes.data ? suppliesRes.data.filter(s => s.current_stock <= s.min_stock).length : 0;

    return {
      pendingTasks: tasksRes.count || 0,
      meetingsToday: meetingsRes.count || 0,
      unreadMessages: messagesRes.count || 0,
      lowSupplies: lowSuppliesCount,
      visitorsToday: visitorsRes.count || 0,
      openRequests: requestsRes.count || 0
    };
  },

  // Generic Operations
  getOfficeRecords: async (table) => {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  },
  createOfficeRecord: async (table, record) => {
    const { data, error } = await supabase.from(table).insert([record]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },
  updateOfficeRecord: async (table, id, updates) => {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },
  deleteOfficeRecord: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};
