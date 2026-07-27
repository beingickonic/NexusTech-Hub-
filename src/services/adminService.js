import { supabase } from './supabaseClient';

const DEFAULT_LIMIT = 10;

const pageRange = (page = 1, limit = DEFAULT_LIMIT) => {
  const from = (Number(page) - 1) * Number(limit);
  return { from, to: from + Number(limit) - 1 };
};

const responseMeta = (count = 0, page = 1, limit = DEFAULT_LIMIT) => ({
  page: Number(page),
  limit: Number(limit),
  total: count || 0,
  totalPages: Math.max(1, Math.ceil((count || 0) / Number(limit)))
});

const normalizeStatus = (status) => String(status || 'pending').toLowerCase();

const getCustomerName = (profile) => {
  if (!profile) return 'Guest User';
  const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return fullName || profile.email || 'Guest User';
};

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...body].join('\n');
};

const getProfilesById = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const { data, error } = await supabase.from('profiles').select('*').in('id', uniqueIds);
  if (error) return {};

  return Object.fromEntries((data || []).map((profile) => [profile.id, profile]));
};

const getFunctionErrorMessage = async (error) => {
  if (!error) return null;

  // error.context is a Response object from the fetch; try to parse its body
  if (error.context && typeof error.context.json === 'function') {
    try {
      // Clone first so the body stream isn't consumed if we need to fallback
      const cloned = error.context.clone ? error.context.clone() : error.context;
      const body = await cloned.json();
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    } catch {
      // JSON parse failed; try plain text
      try {
        const cloned2 = error.context.clone ? error.context.clone() : error.context;
        const text = await cloned2.text();
        if (text) return text;
      } catch { /* ignore */ }
    }
  }

  return error.message || 'Supabase Edge Function failed';
};

const assertFunctionSuccess = async (data, error) => {
  if (error) {
    const msg = await getFunctionErrorMessage(error);
    throw new Error(msg || error.message || 'Edge function error');
  }
  if (data?.error) throw new Error(data.error);
  if (data?.message && !data?.success && !data?.product) throw new Error(data.message);
};

export const adminService = {
  getDashboardStats: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStr = firstDayOfMonth.toISOString();

      // Last 7 days for chart
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const [
        { count: productsCount },
        { data: todayOrders },
        { count: customersCount },
        { count: pendingOrdersCount },
        { count: subscribersCount },
        { count: cashOrdersCount },
        { data: weekOrders },
        { count: activeTicketsCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').gte('created_at', todayStr),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Customer').gte('created_at', monthStr),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing', 'awaiting_payment']),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }).in('provider', ['cash', 'cash_on_delivery', 'Cash On Delivery', 'Cash']),
        supabase.from('orders').select('total_amount, created_at').gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'pending'])
      ]);

      const totalRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const ordersCount = todayOrders?.length || 0;

      // Build real per-day chart data for last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = dayNames[d.getDay()];
        chartMap[key] = { name: label, revenue: 0 };
      }
      (weekOrders || []).forEach(order => {
        const key = order.created_at?.slice(0, 10);
        if (chartMap[key]) {
          chartMap[key].revenue += Number(order.total_amount || 0);
        }
      });
      const chartData = Object.values(chartMap);

      return {
        status: 'success',
        stats: {
          revenue: totalRevenue,
          orders: ordersCount,
          customers: customersCount || 0,
          pendingOrders: pendingOrdersCount || 0,
          products: productsCount || 0,
          subscribers: subscribersCount || 0,
          cashOrders: cashOrdersCount || 0,
          tickets: activeTicketsCount || 0
        },
        chartData
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return { status: 'error', stats: { revenue: 0, orders: 0, customers: 0, pendingOrders: 0, products: 0, subscribers: 0, tickets: 0 }, chartData: [] };
    }
  },

  getSettings: async () => {
    try {
      const { data, error } = await supabase.from('settings').select('key, value');
      if (error) throw error;
      const settingsMap = Object.fromEntries((data || []).map(s => [s.key, s.value]));
      return {
        success: true,
        status: 'success',
        data: {
          store_name:          settingsMap.store_name          || 'NexusTech Hub',
          contact_email:       settingsMap.contact_email       || '',
          contact_phone:       settingsMap.contact_phone       || '',
          currency:            settingsMap.currency            || 'KES',
          theme_primary_color: settingsMap.theme_primary_color || '#FF724C',
          tax_rate:            settingsMap.tax_rate            || '0',
          shipping_fee:        settingsMap.shipping_fee        || '0',
        }
      };
    } catch (error) {
      console.error('Settings fetch error:', error);
      return { success: true, status: 'success', data: { store_name: 'NexusTech Hub', currency: 'KES', theme_primary_color: '#FF724C' } };
    }
  },

  updateSettings: async (settings) => {
    try {
      // Convert FormData or plain object to array of {key, value} upserts
      const entries = settings instanceof FormData
        ? Array.from(settings.entries())
        : Object.entries(settings);

      const upserts = entries
        .filter(([key]) => !['logo', 'favicon'].includes(key))
        .map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));

      if (upserts.length > 0) {
        const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' });
        if (error) throw error;
      }
      return { success: true, data: Object.fromEntries(entries) };
    } catch (error) {
      console.error('Settings update error:', error);
      return { success: false, message: error.message };
    }
  },

  getCustomers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { data, error } = await supabase.functions.invoke('admin-users');
    await assertFunctionSuccess(data, error);

    let allCustomers = data?.customers || [];

    if (search) {
      const s = search.toLowerCase();
      allCustomers = allCustomers.filter(c => 
        (c.full_name || '').toLowerCase().includes(s) || 
        (c.email || '').toLowerCase().includes(s) || 
        (c.phone || '').toLowerCase().includes(s)
      );
    }

    const count = allCustomers.length;
    const { from, to } = pageRange(page, limit);
    const paginatedData = allCustomers.slice(from, to + 1);

    const { data: customerOrders } = await supabase
      .from('orders')
      .select('user_id, total_amount')
      .in('user_id', paginatedData.map(c => c.id));

    const orderStats = {};
    if (customerOrders) {
      customerOrders.forEach(o => {
        if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, spent: 0 };
        orderStats[o.user_id].count += 1;
        orderStats[o.user_id].spent += Number(o.total_amount || 0);
      });
    }

    const customers = paginatedData.map((customer) => {
      const stats = orderStats[customer.id] || { count: 0, spent: 0 };
      return {
        ...customer,
        first_name: customer.first_name || customer.full_name?.split(' ')[0] || 'Customer',
        last_name: customer.last_name || customer.full_name?.split(' ').slice(1).join(' ') || '',
        email: customer.email || 'Email missing in Auth',
        role: customer.role || 'Customer',
        status: customer.status || 'approved',
        total_orders: stats.count || customer.total_orders || 0,
        total_spent: stats.spent || customer.total_spent || 0
      };
    });

    return { status: 'success', success: true, data: customers, meta: responseMeta(count, page, limit) };
  },

  updateCustomerStatus: async (id, status) => {
    const { data, error } = await supabase.from('profiles').update({ status }).eq('id', id).select().single();
    if (error?.message?.toLowerCase().includes('status')) {
      return { status: 'success', success: true, data: { id, status } };
    }
    if (error) throw error;
    return { status: 'success', success: true, data };
  },

  updateUser: async ({ id, first_name, last_name, role }) => {
    const full_name = `${first_name || ''} ${last_name || ''}`.trim();
    const { data, error } = await supabase.from('profiles').update({ full_name, role }).eq('id', id).select().single();
    if (error) throw error;
    return { status: 'success', success: true, data };
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return { status: 'success', success: true };
  },

  getProducts: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const products = (data || []).map((product) => ({
      ...product,
      category_name: product.categories?.name || product.category_name
    }));

    return { status: 'success', success: true, data: products, meta: responseMeta(count, page, limit) };
  },

  getProductById: async (id) => {
    const { data, error } = await supabase.from('products').select('*, categories(name)').eq('id', id).single();
    if (error) throw error;
    return {
      status: 'success',
      success: true,
      data: {
        ...data,
        category_name: data?.categories?.name || data?.category_name
      }
    };
  },

  createProduct: async (productData) => {
    let newProductData = { ...productData };
    let imageFile = null;

    if (productData instanceof FormData) {
      newProductData = Object.fromEntries(productData.entries());
      imageFile = productData.get('image');
      delete newProductData.image;
    }

    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, imageFile);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filePath);
      newProductData.image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase.functions.invoke('admin-products', {
      body: { action: 'create_product', payload: newProductData }
    });

    await assertFunctionSuccess(data, error);

    return { status: 'success', success: true, data: data.product };
  },

  updateProduct: async (productData) => {
    let newProductData = { ...productData };
    let imageFile = null;

    if (productData instanceof FormData) {
      newProductData = Object.fromEntries(productData.entries());
      imageFile = productData.get('image');
      delete newProductData.image;
    }

    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, imageFile);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filePath);
      newProductData.image_url = publicUrlData.publicUrl;
    }

    const { id, ...updatePayload } = newProductData;
    const { data, error } = await supabase.functions.invoke('admin-products', {
      body: { action: 'update_product', id, payload: updatePayload }
    });

    await assertFunctionSuccess(data, error);

    return { status: 'success', success: true, data: data.product };
  },

  deleteProduct: async (productId) => {
    const { data, error } = await supabase.functions.invoke('admin-products', {
      body: { action: 'delete_product', id: productId }
    });

    await assertFunctionSuccess(data, error);

    return { status: 'success', success: true };
  },

  getOrders: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', status = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase.from('orders').select('*, order_items(*, products(title, image_url))', { count: 'exact' }).order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`status.ilike.%${search}%,payment_status.ilike.%${search}%,shipping_name.ilike.%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const profiles = await getProfilesById((data || []).map((order) => order.user_id || order.customer_id));
    const orders = (data || []).map((order) => {
      const profile = profiles[order.user_id || order.customer_id];
      return {
        ...order,
        date: order.created_at,
        customer: order.shippingName || order.shipping_name || getCustomerName(profile),
        email: profile?.email || 'N/A',
        phone: order.shippingPhone || order.shipping_phone || profile?.phone || 'N/A',
        shippingAddress: order.shippingAddress || order.shipping_address || 'Address not provided',
        items: order.order_items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || order.order_items?.length || 0,
        total: Number(order.total_amount || 0),
        status: normalizeStatus(order.status),
        payment_status: order.payment_status || 'unpaid'
      };
    });

    return { status: 'success', success: true, data: orders, meta: responseMeta(count, page, limit) };
  },

  updateOrderStatus: async (orderId, status) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
    if (error) throw error;
    return { status: 'success', success: true, data };
  },

  updateOrder: async (orderId, updates) => {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', orderId).select().single();
    if (error) throw error;
    return { status: 'success', success: true, data };
  },

  getInventory: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', filter = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase.from('products').select('id, title, sku, stock, price', { count: 'exact' }).order('title');

    if (search) query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
    if (filter === 'low') query = query.gt('stock', 0).lte('stock', 10);
    if (filter === 'out') query = query.eq('stock', 0);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const inventory = (data || []).map((item) => ({
      ...item,
      status: Number(item.stock) === 0 ? 'out_of_stock' : Number(item.stock) <= 10 ? 'low_stock' : 'in_stock'
    }));

    return { status: 'success', success: true, data: inventory, meta: responseMeta(count, page, limit) };
  },

  updateStock: async (productId, stock) => {
    const { data, error } = await supabase.functions.invoke('admin-products', {
      body: { action: 'update_stock', id: productId, stock }
    });

    await assertFunctionSuccess(data, error);

    return { status: 'success', success: true, data: data.product };
  },

  getInvoices: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase.from('invoices').select('*, orders(*)', { count: 'exact' }).order('created_at', { ascending: false });

    if (search) query = query.ilike('invoice_number', `%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const profiles = await getProfilesById((data || []).map((invoice) => invoice.orders?.user_id || invoice.customer_id));
    const invoices = (data || []).map((invoice) => {
      const profile = profiles[invoice.orders?.user_id || invoice.customer_id];
      return {
        ...invoice,
        customer: invoice.orders?.shippingName || invoice.orders?.shipping_name || getCustomerName(profile),
        total_amount: invoice.orders?.total_amount || invoice.total_amount || 0,
        payment_status: invoice.orders?.payment_status || 'unpaid',
        pdf_url: invoice.pdf_url || invoice.invoice_url
      };
    });

    return { status: 'success', success: true, data: invoices, meta: responseMeta(count, page, limit) };
  },

  getReports: async (type = 'sales') => {
    if (type === 'customers') {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { status: 'success', success: true, data: data || [] };
    }

    if (type === 'products' || type === 'inventory') {
      const { data, error } = await supabase.from('products').select('*').order('title');
      if (error) throw error;
      return { status: 'success', success: true, data: data || [] };
    }

    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return { status: 'success', success: true, data: data || [] };
  },

  downloadReport: async (type, filename) => {
    const { data } = await adminService.getReports(type);
    if (!data?.length) throw new Error('No data available to export');
    downloadBlob(toCsv(data), `${filename}.csv`, 'text/csv;charset=utf-8;');
  },

  subscribeToInventoryUpdates: (callback) => {
    const subscription = supabase
      .channel('admin-inventory-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => callback(payload.new))
      .subscribe();

    return () => supabase.removeChannel(subscription);
  },

  subscribeToNewOrders: (callback) => {
    const subscription = supabase
      .channel('admin-new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => callback(payload.new))
      .subscribe();

    return () => supabase.removeChannel(subscription);
  },

  // ── Newsletter Subscribers ──────────────────────────────────────────────────

  getNewsletterSubscribers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false });

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return {
      status: 'success',
      success: true,
      data: data || [],
      meta: responseMeta(count, page, limit)
    };
  },

  exportNewsletterSubscribers: async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;
    if (!data?.length) throw new Error('No subscribers to export.');

    downloadBlob(toCsv(data), 'newsletter_subscribers.csv', 'text/csv;charset=utf-8;');
  }
};
