<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus TechHub</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/gamer-ux.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="js/effects.js" defer></script>
</head>
<body>
    <!-- 0. VANGUARD DEPTH BLOBS -->
    <div class="bg-blob" style="top: 10%; left: 5%; background: radial-gradient(circle, #ff4e00, transparent 70%);"></div>
    <div class="bg-blob" style="top: 60%; right: 5%; background: radial-gradient(circle, #00f2ff, transparent 70%); animation-delay: -5s;"></div>

    <nav class="navbar glass">
        <div class="container" style="display: flex; justify-content: space-between; height: 75px; align-items: center;">
            <a href="index.php" class="brand" style="display: flex; align-items: center; gap: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--brand-orange)">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--brand-dark);">Nexus <span style="color: var(--brand-orange);">TechHub</span></span>
            </a>
            <div class="nav-links" style="display: flex; gap: 2rem;">
                <a href="index.php" class="nav-link">Home</a>
                <a href="products.php" class="nav-link">Shop</a>
                <a href="about.php" class="nav-link">About Us</a>
                <a href="help.php" class="nav-link">Help Guide</a>
            </div>
            <div class="nav-actions" style="display: flex; gap: 1.5rem; align-items: center;">
                <a href="login.php" class="btn-icon" title="Login">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </a>
                <a href="cart.php" class="btn btn-primary" style="padding: 0.5rem 1.5rem; font-weight: 700;">Cart</a>
            </div>
        </div>
    </nav>
