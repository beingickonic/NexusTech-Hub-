<?php
/**
 * index.php - Customer Homepage Module
 * Entry point for the Nexus TechHub storefront.
 */
require_once __DIR__ . '/../backend/config/db.php';
require_once __DIR__ . '/include/header.php';
?>

    <!-- 2. VANGUARD HERO MODULE -->
    <header class="hero-vanguard" style="background-image: url('vanguard_hero_display_1776456951095.png');">
        <div class="container">
            <div class="hero-content" style="max-width: 650px;">
                <span style="color: var(--brand-orange); font-weight: 800; text-transform: uppercase; letter-spacing: 3px; font-size: 0.85rem;">Vanguard-Tier Hardware</span>
                <h1 class="title-hero" style="margin-top: 1.5rem; color: var(--brand-dark);">Forging Your Digital Infrastructure</h1>
                <p style="color: var(--text-main); font-size: 1.25rem; line-height: 1.6; margin-bottom: 3rem; opacity: 0.85;">
                    Experience the core of system performance. From elite hardware to enterprise-grade networking—Nexus TechHub delivers the architecture of the future.
                </p>
                <div style="display: flex; gap: 1.5rem;">
                    <button class="btn btn-primary" style="padding: 1.25rem 3rem; font-size: 1rem; font-weight: 700;">Explore Flagships</button>
                    <button class="btn btn-outline" style="padding: 1.25rem 3rem; font-size: 1rem; font-weight: 700;">Software Archive</button>
                </div>
            </div>
        </div>
    </header>

    <!-- 3. VANGUARD ELITE COLLECTION -->
    <section class="section">
        <div class="container">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; text-align: left;">
                <div>
                    <h2 class="title-section">Vanguard Elite Collection</h2>
                    <p style="color: var(--text-muted);">Industrial-grade hardware for extreme system performance.</p>
                </div>
                <div style="background: var(--brand-dark); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; border: 1px solid var(--brand-orange);">
                    <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--brand-orange); font-weight: 800;">Exclusive Inventory</span>
                </div>
            </div>

            <div class="products-grid" id="vanguard-elite-grid" style="margin-top: 3rem;">
                <!-- Product cards will be injected here via API/JSON -->
                <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line short"></div><div class="skeleton-line long"></div><div class="skeleton-line price"></div></div></div>
                <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line short"></div><div class="skeleton-line long"></div><div class="skeleton-line price"></div></div></div>
                <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line short"></div><div class="skeleton-line long"></div><div class="skeleton-line price"></div></div></div>
                <div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line short"></div><div class="skeleton-line long"></div><div class="skeleton-line price"></div></div></div>
            </div>
        </div>
    </section>

    <!-- 4. FOOTER MODULE -->
    <footer style="background: var(--brand-dark); color: white; padding: 5rem 0 2rem 0; margin-top: 4rem;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4rem; margin-bottom: 4rem;">
                <div>
                    <h3 style="color: white; margin-bottom: 1.5rem;">Nexus TechHub</h3>
                    <p style="color: #aaa; max-width: 400px; font-size: 0.95rem;">
                        Design and develop the architecture of your future with our high-end technology solutions.
                    </p>
                </div>
                <div>
                    <h4 style="color: white; margin-bottom: 1.5rem;">Modules</h4>
                    <ul style="color: #aaa; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="help.php">Help Module</a></li>
                        <li><a href="feedback.php">Feedback Module</a></li>
                        <li><a href="products.php">Search Module</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="color: white; margin-bottom: 1.5rem;">Policies</h4>
                    <ul style="color: #aaa; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>Shipping Guide</li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem; text-align: center; color: #666; font-size: 0.85rem;">
                &copy; 2026 Nexus TechHub Web System. All rights reserved.
            </div>
        </div>
    </footer>

    <!-- CORE SCRIPTS -->
    <script src="js/api.js"></script>
    <script src="js/main.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const grid = document.getElementById('vanguard-elite-grid');
            try {
                // Fetching Featured/High-End items
                const res = await ProductService.getAll({ limit: 8 });
                const products = res.data || res;
                
                if (products && products.length > 0) {
                    grid.innerHTML = '';
                    products.forEach(p => {
                        grid.innerHTML += createProductCard(p);
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });

        function createProductCard(p) {
            const price = parseFloat(p.price);
            const salePrice = p.sale_price ? parseFloat(p.sale_price) : null;
            const savings = salePrice ? (price - salePrice) : 0;
            
            const fmt = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' });
            
            return `
                <div class="product-card">
                    <div class="product-image" style="background: rgba(0,0,0,0.02);">
                        <img src="${p.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'}" alt="${p.name}">
                        <div style="position:absolute; top:10px; left:10px; background:var(--brand-dark); color:var(--brand-orange); padding:4px 10px; border-radius:4px; font-size:0.65rem; font-weight:900; letter-spacing:1px; border: 1px solid var(--brand-orange);">VANGUARD ELITE</div>
                        ${savings > 0 ? `<div style="position:absolute; top:10px; right:10px; background:var(--accent-sale); color:white; padding:4px 8px; border-radius:4px; font-size:0.6rem; font-weight:800;">SAVE ${fmt.format(savings)}</div>` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-brand">${p.brand || 'Nexus'}</div>
                        <h4 class="product-title">${p.name}</h4>
                        <div class="price-row">
                            <span class="product-price">${fmt.format(salePrice || price)}</span>
                            ${salePrice ? `<span class="old-price">${fmt.format(price)}</span>` : ''}
                        </div>
                        <div class="product-footer" style="border:none; padding:0; margin-top:1rem;">
                            <button class="btn btn-primary" style="width:100%; font-size:0.9rem;" onclick="addToCart(${p.id})">Reserve Now</button>
                        </div>
                    </div>
                </div>
            `;
        }

        window.addToCart = function(id) {
            // Simplified global cart add
            alert('Item ' + id + ' added to inventory queue.');
        }
    </script>
</body>
</html>
