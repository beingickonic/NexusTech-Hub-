// effects.js - Handles high-tech micro-interactions

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    init3DTilt();
    initMagneticButtons();
    initNavbarScroll();
});

/**
 * UI Controls (Modular Helpers)
 */
function addToCart(id) {
    console.log(`Adding product ${id} to cart...`);
    // ProductService.addToCart(id).then(...)
}

/**
 * Navbar Scroll Physics
 * Toggles the floating bridge state based on scroll position
 */
function initNavbarScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

/**
 * Vanguard 3D Tilt Engine 
 * Creates a perspective tilt effect on interactive cards
 */
function init3DTilt() {
    const cards = document.querySelectorAll('.product-card, .stat-card, .admin-card');
    
    cards.forEach(card => {
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (centerY - y) / 10;
            const rotateY = (x - centerX) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

/**
 * Magnetic Button Interaction
 * Subtle pull effect for primary CTAs
 */
function initMagneticButtons() {
    const btns = document.querySelectorAll('.btn-primary');
    
    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Tracks mouse position over cards to update CSS variables for the glow effect
 */
function initCursorGlow() {
    const cards = document.querySelectorAll('.product-card, .stat-card, .admin-card');
    
    cards.forEach(card => {
        card.classList.add('glow-border');
        
        card.onmousemove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };
    });
}

/**
 * Exported Skeleton Helper
 */
const UX = {
    showSkeletons(containerSelector, count = 4) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <div class="product-card skeleton pulse" style="height: 350px;">
                    <div style="height: 200px; background: rgba(0,0,0,0.05); border-radius: 8px; margin-bottom: 1rem;"></div>
                    <div style="height: 20px; width: 60%; background: rgba(0,0,0,0.05); border-radius: 4px; margin-bottom: 0.5rem;"></div>
                    <div style="height: 20px; width: 40%; background: rgba(0,0,0,0.05); border-radius: 4px;"></div>
                </div>
            `;
        }
    }
};
