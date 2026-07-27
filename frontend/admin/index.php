<?php require_once __DIR__ . '/../../backend/middleware/admin_guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Nexus TechHub</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/gamer-ux.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="../js/effects.js" defer></script>
    <style>
        :root { 
            --sidebar-width: 260px; 
            --brand-orange: #ff4e00;
            --brand-dark: #1a1a1a;
        }
        body { background-color: #f4f5f7; display: flex; min-height: 100vh; font-family: 'Outfit', sans-serif; }
        .admin-sidebar { width: var(--sidebar-width); background-color: var(--brand-dark); color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; left: 0; top: 0; z-index: 1000; }
        .sidebar-header { padding: 2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 0.75rem; }
        .sidebar-menu { flex-grow: 1; padding: 1.5rem 0; }
        .menu-item { padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1rem; color: #aaa; transition: all 0.2s; cursor: pointer; text-decoration: none; font-weight: 500; }
        .menu-item:hover, .menu-item.active { background-color: rgba(255, 78, 0, 0.1); color: var(--brand-orange); border-left: 3px solid var(--brand-orange); }
        .admin-main { margin-left: var(--sidebar-width); flex-grow: 1; padding: 2.5rem; }
        .status-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #eee; }
        .btn-primary { background: var(--brand-orange); color: white; border-radius: 6px; padding: 0.75rem 1.5rem; font-weight: 600; cursor: pointer; border: none; }
    </style>
</head>
<body>

    <aside class="admin-sidebar">
        <div class="sidebar-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-orange)"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span style="font-size: 1.25rem; font-weight: 800;">Nexus <span style="color: var(--brand-orange);">Admin</span></span>
        </div>
        <nav class="sidebar-menu">
            <a href="index.php" class="menu-item active">Dashboard Overview</a>
            <a href="products.php" class="menu-item">Inventory Module</a>
            <a href="orders.php" class="menu-item">Orders Module</a>
            <a href="reports.php" class="menu-item">Reports Module</a>
            <div style="margin-top: auto; padding: 1.5rem;">
                <a href="../index.php" style="color: #666; font-size: 0.9rem;">← Return to Store</a>
            </div>
        </nav>
    </aside>

    <main class="admin-main">
        <header class="admin-header">
            <h2 style="font-weight: 700;">System Overview</h2>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-weight: 600; color: #666;">Admin: <span style="color: #222;">Mary Ivy</span></span>
                <img src="https://i.pravatar.cc/40?u=admin" style="border-radius: 50%;" alt="Avatar">
            </div>
        </header>

        <section class="stat-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(255, 85, 51, 0.1); color: var(--accent-brand);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div class="stat-info">
                    <div class="label">Total Revenue</div>
                    <div class="value" id="stat-revenue">KES 0.00</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(0, 204, 68, 0.1); color: #00cc44;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path></svg>
                </div>
                <div class="stat-info">
                    <div class="label">Total Orders</div>
                    <div class="value" id="stat-orders">0</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(41, 98, 255, 0.1); color: #2962ff;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                </div>
                <div class="stat-info">
                    <div class="label">New Customers</div>
                    <div class="value" id="stat-customers">0</div>
                </div>
            </div>
        </section>

        <div class="admin-card">
            <div class="card-header">
                <h3 style="font-weight: 700;">Recent Tech Orders</h3>
                <a href="orders.html" style="color: var(--accent-brand); font-size: 0.9rem; font-weight: 600;">View All</a>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Device</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody id="recent-orders-table">
                    <!-- Dynamic Rows -->
                </tbody>
            </table>
        </div>
    </main>

    <script src="../js/api.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                // Fetch basic reports (mocked stats for now if API not ready)
                const revenue = 1450000;
                const ordersRaw = 42;
                const customers = 86;

                document.getElementById('stat-revenue').textContent = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(revenue);
                document.getElementById('stat-orders').textContent = ordersRaw;
                document.getElementById('stat-customers').textContent = customers;

                // Fetch recent orders
                const ordersResponse = await fetch('../backend/api/orders/getAll.php');
                const orders = await ordersResponse.json();
                const table = document.getElementById('recent-orders-table');
                
                if (orders.data && orders.data.length > 0) {
                    orders.slice(0, 5).forEach(o => {
                        const row = `
                            <tr>
                                <td>#${o.order_number}</td>
                                <td>${o.first_name} ${o.last_name}</td>
                                <td><span style="color:#666; font-size:0.8rem">Hardware Order</span></td>
                                <td>KES ${o.total_amount}</td>
                                <td><span class="status-badge status-${o.status === 'pending' ? 'pending' : 'paid'}">${o.status}</span></td>
                                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                            </tr>
                        `;
                        table.innerHTML += row;
                    });
                } else {
                    table.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No recent tech orders found.</td></tr>';
                }
            } catch (err) {
                console.error(err);
            }
        });
    </script>
</body>
</html>
