<?php require_once __DIR__ . '/../../backend/middleware/admin_guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reports Module - Nexus TechHub Admin</title>
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
        
        .reports-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        .report-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #eee; margin-bottom: 2rem; }
        .stat-val { font-size: 2rem; font-weight: 800; color: var(--brand-dark); }
        .stat-label { color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
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
            <a href="orders.php" class="menu-item">Orders Module</a>
            <a href="reports.php" class="menu-item active">Reports Module</a>
        </nav>
    </aside>

    <main class="admin-main">
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
            <div>
                <h1 style="font-weight: 800; font-size: 2rem;">System Analytics</h1>
                <p style="color: var(--text-muted);">Audit logs and trend reporting.</p>
            </div>
            <button class="btn btn-outline" style="border: 1px solid #ddd; color: var(--text-main); font-weight: 600;" onclick="window.print()">Export Audit Report</button>
        </header>

        <div class="reports-grid">
            <div class="left-col">
                <!-- Sales Summary -->
                <div class="report-card">
                    <h3 style="margin-bottom: 2rem;">Sales Performance Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                        <div>
                            <div class="stat-label">Total Paid Revenue</div>
                            <div class="stat-val" id="total-revenue">KES 0.00</div>
                        </div>
                        <div>
                            <div class="stat-label">Total Systems Sold</div>
                            <div class="stat-val" id="total-orders">0</div>
                        </div>
                        <div>
                            <div class="stat-label">Avg. System Value</div>
                            <div class="stat-val" id="avg-value">KES 0.00</div>
                        </div>
                    </div>
                </div>

                <!-- Category Performance -->
                <div class="report-card">
                    <h3 style="margin-bottom: 2rem;">Category Volume Report</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 2px solid #f4f5f7;">
                                <th style="padding: 1rem 0;">Tech Category</th>
                                <th style="padding: 1rem 0;">Units Shipped</th>
                                <th style="padding: 1rem 0;">Market Share (%)</th>
                            </tr>
                        </thead>
                        <tbody id="category-report-body">
                            <!-- Populated via API -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="right-col">
                <!-- Low Stock Warnings -->
                <div class="report-card" style="border-left: 4px solid var(--brand-orange);">
                    <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--brand-orange);">Inventory Turnover Warnings</h3>
                    <div id="low-stock-list" style="display: flex; flex-direction: column; gap: 1rem;">
                        <!-- Warnins -->
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const res = await fetch('../backend/api/admin/reports.php');
                const data = await res.json();
                
                if (data.success) {
                    renderReports(data);
                }
            } catch (err) {
                console.error('Audit failed:', err);
            }
        });

        function renderReports(data) {
            const summary = data.summary;
            const fmt = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' });
            
            document.getElementById('total-revenue').textContent = fmt.format(summary.total_revenue || 0);
            document.getElementById('total-orders').textContent = summary.total_orders || 0;
            document.getElementById('avg-value').textContent = fmt.format(summary.avg_order_value || 0);

            // Category Table
            const catBody = document.getElementById('category-report-body');
            const totalUnits = data.category_performance.reduce((a, c) => a + parseInt(c.units_sold), 0);
            catBody.innerHTML = data.category_performance.map(c => `
                <tr style="border-bottom: 1px solid #f4f5f7;">
                    <td style="padding: 1rem 0; font-weight: 600;">${c.name}</td>
                    <td style="padding: 1rem 0;">${c.units_sold} Units</td>
                    <td style="padding: 1rem 0;">${((c.units_sold / totalUnits) * 100).toFixed(1)}%</td>
                </tr>
            `).join('');

            // Inventory Warnings
            const stockList = document.getElementById('low-stock-list');
            stockList.innerHTML = data.inventory_warnings.map(p => `
                <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px;">
                    <div style="font-weight: 700; font-size: 0.9rem;">${p.name}</div>
                    <div style="font-size: 0.8rem; color: #888;">SKU: ${p.sku}</div>
                    <div style="margin-top: 5px; color: ${p.stock_qty < 5 ? 'var(--brand-orange)' : '#666'}; font-weight: 700;">
                        Stock Level: ${p.stock_qty}
                    </div>
                </div>
            `).join('');
        }
    </script>
</body>
</html>
