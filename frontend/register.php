<?php include_once 'include/header.php'; ?>
<main class="auth-container" style="display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 2rem; padding-top: 100px;">
    <div class="auth-card" style="background: var(--bg-subtle); padding: 3rem; border-radius: 12px; width: 100%; max-width: 550px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee;">
        <h2 class="title-section" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--brand-dark);">System Enrollment</h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Join the Nexus TechHub ecosystem.</p>
        
        <div id="error-msg" style="color: #d93025; background: #fff5f5; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; display: none; font-size: 0.9rem;"></div>
        <div id="success-msg" style="color: var(--accent-success); background: #f5fff5; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; display: none; font-size: 0.9rem;"></div>

        <form id="register-form">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group" style="flex:1;">
                    <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">First Name</label>
                    <input type="text" id="first_name" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Last Name</label>
                    <input type="text" id="last_name" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required>
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">System Email</label>
                <input type="email" id="email" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Contact Number</label>
                <input type="tel" id="phone" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" placeholder="254XXXXXXXXX">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">System Password</label>
                <input type="password" id="password" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required minlength="6">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem;">Finalize Enrollment</button>
        </form>
        
        <p style="text-align: center; margin-top: 2rem; color: var(--text-muted); font-size: 0.9rem;">
            Already authenticated? <a href="login.php" style="color: var(--brand-orange); font-weight: 700;">Sign In</a>
        </p>
    </div>
</main>

<script>
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errorDiv = document.getElementById('error-msg');
        const successDiv = document.getElementById('success-msg');
        
        btn.disabled = true;
        btn.textContent = 'Enrolling...';
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        try {
            const payload = {
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            await AuthService.register(payload);
            successDiv.textContent = 'Enrollment successful! Redirecting to auth...';
            successDiv.style.display = 'block';
            setTimeout(() => window.location.href = 'login.php', 2000);
        } catch (err) {
            errorDiv.textContent = err.message || 'Enrollment failed.';
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Finalize Enrollment';
        }
    });
</script>
<?php include_once 'include/footer.php'; ?>
