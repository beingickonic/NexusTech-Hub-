<?php include_once 'include/header.php'; ?>
<div class="container section">
    <div style="max-width: 600px; margin: 0 auto;">
        <h1 class="title-hero" style="color: var(--brand-orange);">Feedback Channel</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Help us architect a better system by sharing your suggestions.</p>

        <div class="admin-card" style="padding: 2.5rem;">
            <form id="feedback-form">
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">System Rating</label>
                    <div style="display: flex; gap: 1rem; font-size: 1.5rem; color: #ddd;">
                        <input type="radio" name="rating" value="1" id="r1" required><label for="r1">★</label>
                        <input type="radio" name="rating" value="2" id="r2"><label for="r2">★</label>
                        <input type="radio" name="rating" value="3" id="r3"><label for="r3">★</label>
                        <input type="radio" name="rating" value="4" id="r4"><label for="r4">★</label>
                        <input type="radio" name="rating" value="5" id="r5"><label for="r5">★</label>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">How was your experience?</label>
                    <textarea id="comment" rows="4" style="width:100%; padding:0.75rem; border:1px solid #ddd; border-radius:6px;" required placeholder="Tell us about the catalog navigation, payment speed, etc."></textarea>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label style="display:block; margin-bottom: 0.5rem; font-weight:600;">Future System Suggestions</label>
                    <textarea id="suggestion" rows="3" style="width:100%; padding:0.75rem; border:1px solid #ddd; border-radius:6px;" placeholder="What tech modules should we add next?"></textarea>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Feedback</button>
            </form>
            <div id="feedback-success" style="display:none; text-align:center; color: var(--accent-success); margin-top: 1rem; font-weight: 600;">
                Thank you! Your feedback has been audited by our team.
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('feedback-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = AuthService.getUser();
        if (!user) return alert('Please login to submit feedback.');

        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Auditing...';

        const payload = {
            user_id: user.id,
            rating: e.target.querySelector('input[name="rating"]:checked').value,
            comment: document.getElementById('comment').value,
            suggestion: document.getElementById('suggestion').value
        };

        try {
            // Mocking API call for now or integrating if backend ready
            console.log('Feedback submitted:', payload);
            setTimeout(() => {
                e.target.style.display = 'none';
                document.getElementById('feedback-success').style.display = 'block';
            }, 1000);
        } catch (err) {
            alert('Submission failed.');
            btn.disabled = false;
        }
    });
</script>

<?php include_once 'include/footer.php'; ?>
