<?php include_once 'include/header.php'; ?>
<main class="auth-container" style="display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 2rem;">
    <div class="auth-card" style="background: var(--bg-subtle); padding: 3rem; border-radius: 12px; width: 100%; max-width: 450px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee;">
        <h2 class="title-section" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--brand-dark);">Welcome Back</h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Access your Nexus TechHub secure dashboard.</p>
        
        <div id="error-msg" style="color: #d93025; background: #fff5f5; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; display: none; font-size: 0.9rem;"></div>

        <form id="login-form">
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">System Email Address</label>
                <input type="email" id="email" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required>
            </div>
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; margin-bottom: 0.5rem; font-weight: 600;">Secure Password</label>
                <input type="password" id="password" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:6px;" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem;">Authenticate System</button>
        </form>
        
        <p style="text-align: center; margin-top: 2rem; color: var(--text-muted); font-size: 0.9rem;">
            New to Nexus? <a href="register.php" style="color: var(--brand-orange); font-weight: 700;">Create System Account</a>
        </p>
    </div>
</main>

<script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const errorDiv = document.getElementById('error-msg');
        
        btn.disabled = true;
        btn.textContent = 'Verifying Credentials...';
        errorDiv.style.display = 'none';

        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await AuthService.login(email, password);
            window.location.href = 'index.php';
        } catch (err) {
            errorDiv.textContent = err.message || 'Authentication failed.';
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Authenticate System';
        }
    });
</script>
<?php include_once 'include/footer.php'; ?>
