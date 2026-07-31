import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const SUPABASE_URL = 'https://ajibjpobcjdbgtcyoedy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWJqcG9iY2pkYmd0Y3lvZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAzNDgsImV4cCI6MjA5NjQzNjM0OH0.aOsDjIjvwfGlrtxAHlNdUkdjXkmRY-6a1EC9FB9tM1s';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DEBUG_PORT = 9234;
const USERDATA = 'C:/Users/ADMINI~1/AppData/Local/Temp/opencode/chrome-profile15';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const anon = createClient(SUPABASE_URL, ANON_KEY);
const out = [];
const email = 'crash_' + Date.now() + '@example.com';
const password = 'derrick1';
let orderId = null;

async function setup() {
  await anon.auth.signUp({ email, password });
  await sleep(1500);
  const { data: s } = await anon.auth.signInWithPassword({ email, password });
  const c = createClient(SUPABASE_URL, ANON_KEY);
  c.auth.setSession({ access_token: s.session.access_token, refresh_token: s.session.refresh_token });
  const { data: prods } = await c.from('products').select('id, price').limit(1);
  const prod = prods[0];
  const { data: order } = await c.from('orders').insert({
    user_id: s.user.id, total_amount: prod.price, payment_status: 'paid', status: 'Finance Approved',
    shipping_name: 'Crash Test', shipping_phone: '0711111111', shipping_address: '1 Main', shipping_city: 'Nairobi'
  }).select().single();
  await c.from('order_items').insert({ order_id: order.id, product_id: prod.id, quantity: 1, price: prod.price });
  orderId = order.id;
  console.log('setup customer + order', order.order_number, orderId);
}

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${USERDATA}`,
  '--window-size=1280,900', 'http://127.0.0.1:5173/',
], { stdio: 'ignore' });

async function getTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const list = await res.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(500);
  }
  throw new Error('No CDP target');
}

let nextId = 0;
const pending = new Map();
let ws;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return 'EXC:' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

async function waitFor(expr, timeoutMs = 60000) {
  for (let i = 0; i < timeoutMs / 500; i++) {
    if (await evaluate(expr)) return true;
    await sleep(500);
  }
  return false;
}

async function check(url, label) {
  await send('Page.navigate', { url });
  await sleep(5000);
  const body = await evaluate('document.body.innerText');
  const errBound = body.includes('An error has occurred');
  console.log(`[${label}] ${url} -> errorBoundary: ${errBound}`);
  if (errBound) console.log('   body:', body.slice(0, 200));
  return errBound;
}

async function main() {
  await setup();
  const target = await getTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
    }
  };
  await send('Runtime.enable');
  await send('Page.enable');
  ws.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    if (data.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(data.params.type)) {
      out.push('[console.' + data.params.type + '] ' + data.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const d = data.params.exceptionDetails;
      out.push('[EXCEPTION] ' + (d.exception?.description || d.text));
    }
  });
  await sleep(2000);
  await evaluate(`localStorage.clear(); sessionStorage.clear(); true`);

  // login as customer
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/login' });
  await sleep(2500);
  await waitFor(`!!document.querySelector('input[type=email]')`);
  await evaluate(`(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const email = document.querySelector('input[type=email]');
    const pwd = document.querySelector('input[type=password]');
    setter.call(email, '${email}'); email.dispatchEvent(new Event('input', { bubbles: true }));
    setter.call(pwd, '${password}'); pwd.dispatchEvent(new Event('input', { bubbles: true }));
    const f = document.querySelector('form'); f.requestSubmit(); return true;
  })()`);
  await waitFor(`location.pathname !== '/login'`, 30000);
  console.log('customer logged in at', await evaluate('location.pathname'));

  const a = await check('http://127.0.0.1:5173/profile', 'CUSTOMER PROFILE');
  const b = await check('http://127.0.0.1:5173/orders', 'PUBLIC ORDERS PAGE');
  const c = await check(`http://127.0.0.1:5173/orders/${orderId}`, 'ORDER DETAILS');

  console.log('--- CONSOLE ERR/WARN (tail) ---');
  const bad = out.filter(l => !l.includes('Failed to load resource'));
  console.log(bad.length ? bad.slice(-25).join('\n') : '(none)');
  writeFileSync('C:/Users/ADMINI~1/AppData/Local/Temp/opencode/repro15-console.log', out.join('\n'));
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error('FATAL', e); writeFileSync('C:/Users/ADMINI~1/AppData/Local/Temp/opencode/repro15-console.log', out.join('\n') + '\nFATAL: ' + e.message); chrome.kill(); });
