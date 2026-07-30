<?php include_once 'include/header.php'; ?>
<div class="container section">
    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 3rem;">
        
        <!-- SEARCH & FILTER SIDEBAR -->
        <aside class="search-sidebar">
            <div class="admin-card" style="padding: 1.5rem; border: none; background: var(--bg-subtle);">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Search Engines</h3>
                
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="font-weight: 700; font-size: 0.85rem; color: var(--brand-dark);">Keywords</label>
                    <input type="text" id="high-speed-search" placeholder="Search SKU, Brand, Model..." style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin-top: 0.5rem;">
                </div>

                <div class="form-group" style="margin-bottom: 2rem;">
                    <label style="font-weight: 700; font-size: 0.85rem; color: var(--brand-dark);">Category Filter</label>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
                        <label class="check-container"><input type="checkbox" class="cat-filter" value="laptops"> Laptops & Desktops</label>
                        <label class="check-container"><input type="checkbox" class="cat-filter" value="smartphones"> Smartphones & Tablets</label>
                        <label class="check-container"><input type="checkbox" class="cat-filter" value="components"> PC Components</label>
                        <label class="check-container"><input type="checkbox" class="cat-filter" value="networking"> Networking Gear</label>
                        <label class="check-container"><input type="checkbox" class="cat-filter" value="software"> Software Licenses</label>
                    </div>
                </div>

                <div class="form-group">
                    <label style="font-weight: 700; font-size: 0.85rem; color: var(--brand-dark);">Price Range (KES)</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.8rem;">
                        <input type="number" id="min-price" placeholder="Min" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        <span>-</span>
                        <input type="number" id="max-price" placeholder="Max" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>

                <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" onclick="performSearch()">Apply Audit</button>
            </div>
        </aside>

        <!-- CATALOG GRID -->
        <main>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.5rem;">Tech Inventory <span id="results-count" style="font-size: 0.9rem; font-weight: 400; color: var(--text-muted); margin-left: 1rem;">Showing all items</span></h2>
                <select id="sort-filter" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
            </div>

            <div class="products-grid" id="catalog-grid">
                <!-- Data populated via performSearch() -->
            </div>
        </main>
    </div>
</div>

<style>
    .check-container { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--text-main); cursor: pointer; }
    .check-container:hover { color: var(--brand-orange); }
</style>

<script>
    let allProducts = [];

    document.addEventListener('DOMContentLoaded', async () => {
        await loadInitialCatalog();
        
        // Instant search trigger
        document.getElementById('high-speed-search').addEventListener('input', debounce(performSearch, 300));
    });

    async function loadInitialCatalog() {
        const grid = document.getElementById('catalog-grid');
        grid.innerHTML = '<div class="skeleton-card"></div>'.repeat(6);
        
        try {
            const res = await ProductService.getAll();
            allProducts = res.data || res;
            renderGrid(allProducts);
        } catch (err) {
            grid.innerHTML = '<p>System query failed.</p>';
        }
    }

    function renderGrid(products) {
        const grid = document.getElementById('catalog-grid');
        document.getElementById('results-count').textContent = `Showing ${products.length} systems`;
        
        grid.innerHTML = '';
        if(products.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 4rem;">No matching tech found.</div>';
            return;
        }

        products.forEach(p => {
            grid.innerHTML += createProductCardExtended(p);
        });
    }

    function createProductCardExtended(p) {
        const price = parseFloat(p.price);
        const priceFmt = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(price);
        
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${p.primary_image || 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <div class="product-brand">${p.brand || 'Nexus'}</div>
                    <h4 class="product-title" style="min-height:3rem;">${p.name}</h4>
                    <div style="font-size: 0.8rem; color: var(--brand-orange); font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase;">
                        SKU: ${p.sku || 'N/A'}
                    </div>
                    <div class="product-footer" style="border:none; padding:0; margin-top:1rem;">
                        <span class="product-price" style="font-size: 1.1rem;">${priceFmt}</span>
                        <button class="btn btn-primary" style="padding: 0.5rem; border-radius: 50%; width: 36px; height: 36px;" onclick="addToCart(${p.id})">
                             +
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function performSearch() {
        const query = document.getElementById('high-speed-search').value.toLowerCase();
        const minP = parseFloat(document.getElementById('min-price').value) || 0;
        const maxP = parseFloat(document.getElementById('max-price').value) || Infinity;
        
        const selectedCats = Array.from(document.querySelectorAll('.cat-filter:checked')).map(cb => cb.value);

        const filtered = allProducts.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(query) || (p.brand && p.brand.toLowerCase().includes(query)) || (p.sku && p.sku.toLowerCase().includes(query));
            const matchPrice = p.price >= minP && p.price <= maxP;
            const matchCat = selectedCats.length === 0 || selectedCats.includes(p.category_slug);
            
            return matchSearch && matchPrice && matchCat;
        });

        renderGrid(filtered);
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
</script>

<?php include_once 'include/footer.php'; ?>
