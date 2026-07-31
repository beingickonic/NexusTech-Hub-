import { createClient } from '@supabase/supabase-js';

const url = 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  // 1. Create a throwaway customer
  const email = 'flowtest_' + Date.now() + '@example.com';
  const anon = createClient(url, anonKey);
  const { data: su, error: suErr } = await anon.auth.signUp({ email, password: 'derrick1' });
  if (suErr) { console.log('SIGNUP ERR', suErr.message); return; }
  console.log('Signed up', email, '->', su.user?.id);
  await sleep(1500);

  // 2. Login as the customer
  const cust = createClient(url, anonKey);
  const { data: li, error: liErr } = await cust.auth.signInWithPassword({ email, password: 'derrick1' });
  if (liErr) { console.log('LOGIN ERR', liErr.message); return; }
  cust.auth.setSession({ access_token: li.session.access_token, refresh_token: li.session.refresh_token });
  console.log('Customer logged in');

  // 3. Create a product if none (need a product id). Use existing product.
  const { data: prods } = await cust.from('products').select('id, title, price').limit(1);
  const product = prods?.[0];
  if (!product) { console.log('NO PRODUCTS in DB'); return; }
  console.log('Using product', product.id, product.title, product.price);

  // 4. Place an order
  const { data: order, error: oErr } = await cust.from('orders').insert({
    user_id: li.user.id,
    total_amount: product.price * 2,
    payment_status: 'unpaid',
    status: 'Pending',
    shipping_name: 'Flow Test',
    shipping_phone: '0700000000',
    shipping_address: 'Test Street',
    shipping_city: 'Nairobi',
    shipping_postal_code: '00100',
    payment_method: null,
  }).select().single();
  if (oErr) { console.log('ORDER ERR', oErr.message); return; }
  console.log('Order created', order.id, 'status=', order.status);

  const { error: oiErr } = await cust.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 2,
    price: product.price,
  });
  if (oiErr) { console.log('ITEMS ERR', oiErr.message); return; }

  // 5. Verify mock payment
  const { data: vm, error: vmErr } = await cust.rpc('verify_mock_payment', {
    p_order_id: order.id,
    p_verification_code: '123456',
  });
  if (vmErr) { console.log('VERIFY_MOCK_PAYMENT ERR:', vmErr.code, vmErr.message); return; }
  console.log('verify_mock_payment OK:', JSON.stringify(vm).slice(0, 120));

  // 6. Check order status after payment
  const { data: afterPay } = await cust.from('orders').select('status, payment_status, finance_status').eq('id', order.id).single();
  console.log('After payment ->', JSON.stringify(afterPay));

  // 7. Finance user checks pending approvals (exact getPendingApprovals query)
  const fin = createClient(url, anonKey);
  const { data: fl } = await fin.auth.signInWithPassword({ email: 'finance@gmail.com', password: 'derrick1' });
  fin.auth.setSession({ access_token: fl.session.access_token, refresh_token: fl.session.refresh_token });
  const { data: pend, error: pErr } = await fin.from('orders')
    .select(`
      *,
      profiles:user_id (id, full_name, phone),
      order_items (quantity, price, products:product_id (title, image_url)),
      payments (id, amount, provider, transaction_reference, status, created_at)
    `)
    .in('status', ['Pending Finance Approval', 'Paid'])
    .order('updated_at', { ascending: false });
  console.log('getPendingApprovals embed:', pErr ? ('ERR ' + pErr.code + ' ' + pErr.message) : 'OK rows=' + (pend?.length ?? 0));
  if (pend && pend.length > 0) {
    const p = pend[0];
    console.log('  first pending ->', JSON.stringify({
      id: p.id, order_number: p.order_number, status: p.status,
      customer: Array.isArray(p.profiles) ? p.profiles[0]?.full_name : p.profiles?.full_name,
      total: p.total_amount, items: (p.order_items || []).length,
    }));
  }

  // 7b. Finance dashboard stats query
  const { count: pc, error: pcErr } = await fin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending Finance Approval');
  console.log('dashboard pendingCount:', pcErr ? ('ERR ' + pcErr.code + ' ' + pcErr.message) : pc);

  // 8. Finance approves the order
  const { data: ap, error: apErr } = await fin.rpc('finance_approve_order', {
    p_order_id: order.id,
    p_officer_id: fl.user.id,
    p_notes: 'Auto test approval',
  });
  console.log('finance_approve_order:', apErr ? ('ERR ' + apErr.code + ' ' + apErr.message) : JSON.stringify(ap));

  const { data: final } = await cust.from('orders').select('status, finance_status, finance_approved_at, finance_approved_by').eq('id', order.id).single();
  console.log('Final order ->', JSON.stringify(final));
}

main().catch(e => console.error('FATAL', e));
