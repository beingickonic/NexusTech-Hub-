<?php require_once __DIR__ . '/../../backend/middleware/admin_guard.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Management - Nexus TechHub Admin</title>
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
        .admin-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #eee; }
        .btn-primary { background: var(--brand-orange); color: white; border-radius: 6px; padding: 0.75rem 1.5rem; font-weight: 600; cursor: pointer; border: none; }
        .stock-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .stock-low { background: #fee2e2; color: #dc2626; }
        .stock-ok { background: #dcfce7; color: #16a34a; }
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
            <a href="products.php" class="menu-item active">Inventory Module</a>
            <a href="orders.php" class="menu-item">Orders Module</a>
            <a href="reports.php" class="menu-item">Reports Module</a>
        </nav>
    </aside>

    <main class="admin-main">
        <header class="admin-header">
            <h2 style="font-weight: 700;">Inventory Management</h2>
            <button class="btn btn-primary" onclick="openModal()">+ Add New Hardware</button>
        </header>

        <div class="admin-card">
            <div class="card-header">
                <h3 style="font-weight: 700;">Product Catalog</h3>
                <input type="text" id="search-inventory" placeholder="Search by SKU or Name..." style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Device Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="inventory-table-body">
                    <!-- Dynamic Rows -->
                </tbody>
            </table>
        </div>
    </main>

    <!-- Add/Edit Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <h3 id="modal-title" style="margin-bottom: 1.5rem;">Add New Product</h3>
            <form id="product-form">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="name" required placeholder="e.g. MacBook Pro M3">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="category_id" required>
                        <option value="1">Laptops</option>
                        <option value="2">Smartphones</option>
                        <option value="3">PC Components</option>
                        <option value="4">Networking</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex:1;">
                        <label>Price (KES)</label>
                        <input type="number" id="price" required>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Stock Qty</label>
                        <input type="number" id="stock" required>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="button" class="btn btn-outline" style="flex:1" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex:1">Save Product</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../js/api.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', loadInventory);

        async function loadInventory() {
            try {
                const products = await ProductService.getAll();
                const tbody = document.getElementById('inventory-table-body');
                tbody.innerHTML = '';

                (products.data || products).forEach(p => {
                    const row = `
                        <tr>
                            <td>#${p.id}</td>
                            <td><strong>${p.name}</strong><br><small style="color:#888">${p.brand || 'Generic'}</small></td>
                            <td>${p.category_name || 'Tech'}</td>
                            <td>KES ${parseFloat(p.price).toLocaleString()}</td>
                            <td><span class="stock-badge ${p.stock_qty < 10 ? 'stock-low' : 'stock-ok'}">${p.stock_qty} available</span></td>
                            <td>
                                <button onclick="editProduct(${p.id})" style="color:var(--accent-brand); border:none; background:none; cursor:pointer; font-weight:600;">Edit</button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } catch (err) { console.error(err); }
        }

        function openModal() { document.getElementById('product-modal').style.display = 'flex'; }
        function closeModal() { document.getElementById('product-modal').style.display = 'none'; }
    </script>
</body>
</html>
