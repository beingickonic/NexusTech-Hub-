// main.js - Global scripts for the vanilla frontend
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    updateCartCount();
});

function initNavbar() {
    const authActions = document.getElementById('nav-auth-actions');
    const user = AuthService.getUser();

    if (user) {
        // Logged in
        authActions.innerHTML = `
            <a href="profile.html" class="user-greeting" style="color: var(--text-primary); font-weight: 600;">
                Hi, ${user.first_name || 'User'}
            </a>
            <button id="btn-logout" class="btn btn-outline" style="padding: 0.5rem 1rem;">Logout</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => {
            AuthService.logout();
        });
    } else {
        // Guest
        authActions.innerHTML = `
            <a href="login.html" class="nav-link">Login</a>
            <a href="register.html" class="btn" style="background: var(--bg-surface-elevated); font-size: 0.9rem; padding: 0.5rem 1rem;">Register</a>
        `;
    }
}

// ---- CART SYSTEM ----
const CartService = {
    getItems() {
        const cart = localStorage.getItem('nth_cart');
        return cart ? JSON.parse(cart) : [];
    },
    addItem(product) {
        const items = this.getItems();
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            items.push({ ...product, qty: 1 });
        }
        localStorage.setItem('nth_cart', JSON.stringify(items));
        updateCartCount();
        showToast('Item added to cart!');
    },
    getTotalQuantity() {
        return this.getItems().reduce((sum, item) => sum + item.qty, 0);
    }
};

function updateCartCount() {
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
        const total = CartService.getTotalQuantity();
        if (total > 0) {
            badge.textContent = total;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
// ---- PREMIUM UI EFFECTS ----

// 2. Premium Toast Notification (Besa Theme)
let activeToastTimeout = null;

function showToast(message) {
    let t = document.getElementById('toast-container');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast-container';
        document.body.appendChild(t);
    }
    
    // Clear old toast to prevent stacking spam
    if (activeToastTimeout) clearTimeout(activeToastTimeout);
    t.innerHTML = '';
    
    const msg = document.createElement('div');
    msg.className = 'toast-premium';
    // Updated SVG stroke to var(--accent-brand) for Besa Theme
    msg.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;
    
    t.appendChild(msg);
    
    // Auto remove after 3s
    activeToastTimeout = setTimeout(() => {
        msg.classList.add('hide');
        setTimeout(() => msg.remove(), 400); // Wait for animation
    }, 3000);
}
