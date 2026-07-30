<?php require_once __DIR__ . '/../../backend/middleware/admin_guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Management - Nexus TechHub Admin</title>
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
        .admin-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #eee; overflow: hidden; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .status-pending { background: #fff5e6; color: #ff9900; }
        .status-paid { background: #e6ffef; color: #00cc44; }
        .status-shipped { background: #e6f0ff; color: #2962ff; }
    </style>
</head>
<body>
    <aside class="admin-sidebar">
        <div class="sidebar-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-orange)"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span style="font-size: 1.25rem; font-weight: 800;">Nexus <span style="color: var(--brand-orange);">Admin</span></span>
        </div>
        <nav class="sidebar-menu">
            <a href="index.php" class="menu-item">Dashboard Overview</a>
            <a href="products.php" class="menu-item">Inventory Module</a>
            <a href="orders.php" class="menu-item active">Orders Module</a>
            <a href="reports.php" class="menu-item">Reports Module</a>
        </nav>
    </aside>

    <main class="admin-main">
        <header class="admin-header">
            <h2 style="font-weight: 700;">Order Management</h2>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline" style="padding: 0.5rem 1rem;">Export CSV</button>
            </div>
        </header>

        <div class="admin-card">
            <div class="card-header">
                <h3 style="font-weight: 700;">All System Orders</h3>
                <div style="display: flex; gap: 1rem;">
                    <select id="status-filter" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                    </select>
                </div>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="orders-table-body">
                    <!-- Dynamic Rows -->
                </tbody>
            </table>
        </div>
    </main>

    <script src="../js/api.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', loadOrders);

        async function loadOrders() {
            try {
                const response = await OrderService.getAll();
                const orders = response.data || response;
                const tbody = document.getElementById('orders-table-body');
                tbody.innerHTML = '';

                orders.forEach(o => {
                    const row = `
                        <tr>
                            <td><strong>${o.order_number}</strong></td>
                            <td>${o.first_name} ${o.last_name}<br><small style="color:#888">${o.email}</small></td>
                            <td>KES ${parseFloat(o.total_amount).toLocaleString()}</td>
                            <td><span style="font-size:0.8rem">${o.payment_method}</span></td>
                            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                            <td>
                                <select onchange="updateStatus(${o.id}, this.value)" style="padding: 0.2rem; font-size: 0.8rem;">
                                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Paid</option>
                                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                </select>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } catch (err) { console.error(err); }
        }

        async function updateStatus(id, newStatus) {
            try {
                await OrderService.updateStatus(id, newStatus);
                alert('Order status updated successfully');
                loadOrders();
            } catch (err) { alert('Failed to update status'); }
        }
    </script>
</body>
</html>
