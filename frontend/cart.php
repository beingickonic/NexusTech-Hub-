<?php include_once 'include/header.php'; ?>
<main class="container cart-container" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; padding: 100px 0; min-height: 80vh;">
    <div>
        <h2 class="title-section" style="font-size: 2rem; margin-bottom: 2rem;">Transactional Cart</h2>
        <div id="cart-items" class="cart-items" style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- Javascript will populate -->
        </div>
    </div>
    <div>
        <div class="cart-summary" style="background: var(--bg-subtle); padding: 2rem; border-radius: 12px; border: 1px solid #eee; height: fit-content;">
            <h3 style="margin-bottom: 1.5rem; font-size: 1.25rem;">Order Summary</h3>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-muted);">
                <span>Subtotal</span>
                <span id="summary-subtotal">KES 0.00</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-muted);">
                <span>System Processing</span>
                <span>Free</span>
            </div>
            <div class="summary-total" style="display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd; font-size: 1.25rem; font-weight: bold;">
                <span>Total</span>
                <span id="summary-total" style="color: var(--brand-orange);">KES 0.00</span>
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" onclick="checkout()">Proceed to Secure Checkout</button>
        </div>
    </div>
</main>

<!-- CHECKOUT MODAL -->
<div id="checkout-modal" class="modal" style="display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); align-items:center; justify-content:center;">
    <div class="modal-content" style="background:white; padding:2.5rem; border-radius:12px; width:450px; max-width:90%; position:relative;">
        <button onclick="closeCheckout()" style="position:absolute; right:1.5rem; top:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
        <h3 style="margin-bottom:1.5rem; font-size:1.5rem; font-weight:700;">Secure M-Pesa Checkout</h3>
        <div id="checkout-step-1">
            <p style="color:#666; margin-bottom:1.5rem;">Audit shipping destination for hardware dispatch.</p>
            <div class="form-group" style="margin-bottom:1rem;">
                <label style="display:block; margin-bottom:0.5rem; font-weight:600;">System Delivery Address</label>
                <textarea id="shipping-address" rows="3" style="width:100%; padding:0.75rem; border:1px solid #ddd; border-radius:6px; font-family:inherit;" placeholder="House #, Street, City, Country"></textarea>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="nextStep(2)">Audit Payment Method</button>
        </div>
        <div id="checkout-step-2" style="display:none;">
            <p style="color:#666; margin-bottom:1.5rem;">Safaricom M-Pesa Gateway</p>
            <div class="form-group" style="margin-bottom:1rem;">
                <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Authorized Phone Number</label>
                <input type="tel" id="payment-phone" placeholder="2547XXXXXXXX" style="width:100%; padding:0.75rem; border:1px solid #ddd; border-radius:6px;">
            </div>
            <p style="font-size:0.85rem; color:#888; margin-bottom:1.5rem;">The system will trigger an STK push. Enter your M-Pesa PIN on your handset.</p>
            <button class="btn btn-primary" style="width:100%;" id="btn-pay-now" onclick="processPayment()">Clear Balance & Finalize</button>
        </div>
        <div id="checkout-step-success" style="display:none; text-align:center;">
            <div style="color:var(--accent-success); margin-bottom:1rem;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3>Transaction Successful</h3>
            <p style="color:#666; margin-top:0.5rem; margin-bottom:1.5rem;">Your hardware order/software activation has been audited and cleared.</p>
            <button class="btn btn-outline" onclick="window.location.href='index.php'">Return to Dashboard</button>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', renderCart);

    function renderCart() {
        const items = CartService.getItems();
        const container = document.getElementById('cart-items');
        
        if (items.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 4rem 0;">Your system queue is empty. <br><br><a href="products.php" class="btn btn-outline mt-3">Browse Inventory</a></div>';
            updateTotals(0);
            return;
        }

        let subtotal = 0;
        container.innerHTML = '';

        items.forEach(item => {
            const totalItemPrice = item.price * item.qty;
            subtotal += totalItemPrice;
            const fmtPrice = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalItemPrice);
            
            container.innerHTML += `
                <div class="cart-item" style="display: flex; gap: 1rem; background: white; padding: 1.25rem; border-radius: 8px; border: 1px solid #eee; align-items: center;">
                    <img src="${item.primary_image || 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain;">
                    <div style="flex-grow: 1;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${item.name}</h4>
                        <div style="color: var(--brand-orange); font-weight: bold;">${fmtPrice}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; background: #f9f9f9; padding: 0.4rem 0.8rem; border-radius: 20px;">
                        <button onclick="updateQty(${item.id}, -1)">-</button>
                        <span style="font-weight: 700; width: 20px; text-align: center;">${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
        updateTotals(subtotal);
    }

    function updateQty(id, delta) {
        const items = CartService.getItems();
        const idx = items.findIndex(i => i.id === id);
        if (idx > -1) {
            items[idx].qty += delta;
            if (items[idx].qty <= 0) items.splice(idx, 1);
            localStorage.setItem('nth_cart', JSON.stringify(items));
            renderCart();
            updateCartCount();
        }
    }

    function updateTotals(val) {
        const fmt = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val);
        document.getElementById('summary-subtotal').textContent = fmt;
        document.getElementById('summary-total').textContent = fmt;
    }

    function checkout() {
        if (!AuthService.getUser()) return window.location.href = 'login.html';
        document.getElementById('checkout-modal').style.display = 'flex';
    }

    function closeCheckout() { document.getElementById('checkout-modal').style.display = 'none'; }
    function nextStep(step) {
        if (step === 2) {
            if (!document.getElementById('shipping-address').value.trim()) return alert('Address required');
            document.getElementById('checkout-step-1').style.display = 'none';
            document.getElementById('checkout-step-2').style.display = 'block';
        }
    }

    async function processPayment() {
        const btn = document.getElementById('btn-pay-now');
        btn.disabled = true;
        btn.textContent = 'Triggering STK Push...';

        try {
            const user = AuthService.getUser();
            const items = CartService.getItems();
            const res = await OrderService.create({
                user_id: user.id,
                total_amount: items.reduce((a, i) => a + (i.price * i.qty), 0),
                shipping_address: document.getElementById('shipping-address').value,
                payment_method: 'M-Pesa',
                items: items
            });

            if (res.success) {
                setTimeout(() => {
                    document.getElementById('checkout-step-2').style.display = 'none';
                    document.getElementById('checkout-step-success').style.display = 'block';
                    CartService.clear();
                    updateCartCount();
                }, 2000);
            }
        } catch (err) {
            alert('Payment failed');
            btn.disabled = false;
        }
    }
</script>
<?php include_once 'include/footer.php'; ?>
