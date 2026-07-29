const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const report = {
  passed: [],
  failed: []
};

function pass(name, msg) {
  console.log(`✅ PASS: ${name} - ${msg}`);
  report.passed.push({ name, msg });
}

function fail(name, msg) {
  console.log(`❌ FAIL: ${name} - ${msg}`);
  report.failed.push({ name, msg });
}

async function runTests() {
  console.log('Starting ERP Validation Suite...');

  // 1. Setup Test Data
  let productId, warehouseId, supplierId, inventoryId, testUserId;

  try {
    console.log('Setting up test data...');
    // Create User
    const { data: user, error: userErr } = await supabase.auth.admin.createUser({
      email: `test_user_${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true
    });
    if (userErr) throw new Error("Create user failed: " + userErr.message);
    testUserId = user.user.id;

    await supabase.from('profiles').upsert({ id: testUserId, email: user.user.email, role: 'inventory', full_name: 'Test Inv Officer', department: 'Inventory' });

    // Create Warehouse
    const { data: wh, error: whErr } = await supabase.from('warehouse_locations').insert({ name: 'Test Warehouse', address: 'Test City' }).select().single();
    if (whErr) throw new Error("Create warehouse failed: " + whErr.message);
    warehouseId = wh.id;

    // Create Supplier
    const { data: sup, error: supErr } = await supabase.from('suppliers').insert({ name: 'Test Supplier', email: 'sup@example.com' }).select().single();
    if (supErr) throw new Error("Create supplier failed: " + supErr.message);
    supplierId = sup.id;

    // Create Product
    const { data: prod, error: prodErr } = await supabase.from('products').insert({ title: 'Test ERP Product', sku: `TST-${Date.now()}`, price: 100, stock: 0 }).select().single();
    if (prodErr) throw new Error("Create product failed: " + prodErr.message);
    productId = prod.id;

    // Create Inventory
    const { data: inv, error: invErr } = await supabase.from('inventory').insert({
      product_id: productId, warehouse_id: warehouseId, quantity_on_hand: 10, cost_price: 50, supplier_id: supplierId
    }).select().single();
    if (invErr) throw new Error("Create inventory failed: " + invErr.message);
    inventoryId = inv.id;

    pass("Test Data Setup", "Created test warehouse, supplier, product, and inventory.");
  } catch (err) {
    fail("Test Data Setup", err.message);
    process.exit(1);
  }

  // Workflow 1 & 3: Procurement & GRN
  try {
    // We will call the receive_goods RPC
    // Wait, receive_goods takes p_request_id. We need a purchase request.
    const { data: pr, error: prErr } = await supabase.from('purchase_requests').insert({
      product_id: productId, supplier_id: supplierId, quantity: 50, status: 'Approved', requested_by: testUserId
    }).select().single();
    if (prErr) throw new Error("PR create failed: " + prErr.message);

    const { error: rpcErr } = await supabase.rpc('receive_goods', {
      p_request_id: pr.id,
      p_warehouse_id: warehouseId,
      p_quantity: 50,
      p_user_id: testUserId
    });
    if (rpcErr) throw new Error("receive_goods failed: " + rpcErr.message);

    // Verify Inventory Increased (was 10, should be 60)
    const { data: invCheck } = await supabase.from('inventory').select('quantity_on_hand').eq('id', inventoryId).single();
    if (invCheck.quantity_on_hand !== 60) throw new Error(`Inventory quantity mismatch. Expected 60, got ${invCheck.quantity_on_hand}`);

    // Verify Finance Asset Created (50 * cost 70 = 3500)
    // The trigger should have created a transaction of type Asset Increase
    const { data: finCheck } = await supabase.from('transactions').select('*').eq('type', 'Asset Increase').order('created_at', { ascending: false }).limit(1).single();
    if (!finCheck || finCheck.amount != 3500) throw new Error("Finance Asset Increase not logged correctly.");

    // Verify Audit Log
    const { data: movCheck } = await supabase.from('inventory_movements').select('*').eq('inventory_id', inventoryId).eq('movement_type', 'IN').order('created_at', { ascending: false }).limit(1).single();
    if (!movCheck || movCheck.quantity != 50) throw new Error("Inventory Movement not logged correctly.");

    pass("Workflow 1 & 3 (Procurement & GRN)", "Goods Received Note processed, Inventory updated, Finance Asset logged, Audit log created.");
  } catch (err) {
    fail("Workflow 1 & 3 (Procurement & GRN)", err.message);
  }

  // Workflow 4: Damaged Stock
  try {
    // Report Damaged Stock
    const { data: dmg, error: dmgErr } = await supabase.from('damaged_stock').insert({
      inventory_id: inventoryId, quantity: 5, reason: 'Broken', reported_by: testUserId, status: 'Reported'
    }).select().single();
    if (dmgErr) throw new Error("Report damage failed: " + dmgErr.message);

    // Dispose Damaged Stock
    const { error: dispErr } = await supabase.rpc('dispose_damaged_stock', {
      p_damage_id: dmg.id,
      p_user_id: testUserId
    });
    if (dispErr) throw new Error("dispose_damaged_stock failed: " + dispErr.message);

    // Verify Inventory Reduced (60 - 5 = 55)
    const { data: invCheck } = await supabase.from('inventory').select('quantity_on_hand').eq('id', inventoryId).single();
    if (invCheck.quantity_on_hand !== 55) throw new Error(`Inventory quantity mismatch. Expected 55, got ${invCheck.quantity_on_hand}`);

    // Verify Finance Write-off (5 * 50 = 250)
    const { data: finCheck } = await supabase.from('transactions').select('*').eq('type', 'Write-off').order('created_at', { ascending: false }).limit(1).single();
    if (!finCheck || finCheck.amount != 250) throw new Error("Finance Write-off not logged correctly.");

    pass("Workflow 4 (Damaged Stock)", "Damaged stock disposed, Inventory reduced, Finance Write-off logged.");
  } catch(err) {
    fail("Workflow 4 (Damaged Stock)", err.message);
  }

  // Workflow 5: Warehouse Transfer
  try {
    // Create Warehouse B
    const { data: wh2 } = await supabase.from('warehouse_locations').insert({ name: 'Warehouse B' }).select().single();
    
    // Transfer 15 items
    const { error: transferErr } = await supabase.rpc('transfer_stock', {
      p_product_id: productId,
      p_source_warehouse_id: warehouseId,
      p_dest_warehouse_id: wh2.id,
      p_quantity: 15,
      p_user_id: testUserId
    });
    // Wait, did I create a transfer_stock RPC? Let's check if it exists by catching the error.
    if (transferErr) {
       // If RPC doesn't exist, we will manually simulate a transfer by adjusting inventory.
       if(transferErr.code === 'PGRST202') {
          throw new Error("RPC transfer_stock not found. Requires manual implementation test.");
       }
       throw new Error("Transfer failed: " + transferErr.message);
    }
    pass("Workflow 5 (Warehouse Transfer)", "Transfer completed.");
  } catch(err) {
    // We didn't create transfer_stock RPC in the previous schema.
    if (err.message.includes('not found')) {
      fail("Workflow 5 (Warehouse Transfer)", "RPC transfer_stock does not exist. (Expected failure based on current schema scope)");
    } else {
      fail("Workflow 5 (Warehouse Transfer)", err.message);
    }
  }

  // Clean up
  try {
    await supabase.from('products').delete().eq('id', productId);
    await supabase.from('warehouse_locations').delete().eq('id', warehouseId);
    await supabase.from('suppliers').delete().eq('id', supplierId);
    await supabase.auth.admin.deleteUser(testUserId);
  } catch(e) {}

  fs.writeFileSync('test_results.json', JSON.stringify(report, null, 2));
  console.log("Validation complete.");
}

runTests();
