/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Custom breakpoints ──────────────────────────────
      screens: {
        'xs': '375px',   // Small phones (iPhone SE, Galaxy A series)
        'sm': '640px',
        'md': '768px',   // Tablets
        'lg': '1024px',  // Desktop
        'xl': '1280px',
        '2xl': '1536px',
      },

      colors: {
        // Legacy aliases (kept for back-compat, mapped to brand palette)
        primary: 'rgb(var(--nexus-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--nexus-primary-hover) / <alpha-value>)',
        accent: 'rgb(var(--nexus-gold) / <alpha-value>)',
        success: 'rgb(var(--nexus-success) / <alpha-value>)',
        warning: 'rgb(var(--nexus-gold) / <alpha-value>)',
        danger: 'rgb(var(--nexus-error) / <alpha-value>)',
        info: 'rgb(var(--nexus-info) / <alpha-value>)',
        'off-white': 'rgb(var(--nexus-bg) / <alpha-value>)',
        'dark-navy': 'rgb(var(--nexus-dark-navy) / <alpha-value>)',
        'dark-bg': 'rgb(var(--nexus-bg) / <alpha-value>)',
        'dark-surface': 'rgb(var(--nexus-surface) / <alpha-value>)',
        'muted-text': 'rgb(var(--nexus-muted) / <alpha-value>)',

        // Official Nexus Design Tokens (theme-aware CSS variables)
        nexus: {
          primary: 'rgb(var(--nexus-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--nexus-primary-hover) / <alpha-value>)',
          secondary: 'rgb(var(--nexus-secondary) / <alpha-value>)',
          navy: 'rgb(var(--nexus-navy) / <alpha-value>)',
          'dark-navy': 'rgb(var(--nexus-dark-navy) / <alpha-value>)',
          gold: 'rgb(var(--nexus-gold) / <alpha-value>)',
          'light-gold': 'rgb(var(--nexus-light-gold) / <alpha-value>)',
          bg: 'rgb(var(--nexus-bg) / <alpha-value>)',
          surface: 'rgb(var(--nexus-surface) / <alpha-value>)',
          card: 'rgb(var(--nexus-card) / <alpha-value>)',
          sidebar: 'rgb(var(--nexus-sidebar) / <alpha-value>)',
          navbar: 'rgb(var(--nexus-navbar) / <alpha-value>)',
          hover: 'rgb(var(--nexus-hover) / <alpha-value>)',
          heading: 'rgb(var(--nexus-heading) / <alpha-value>)',
          text: 'rgb(var(--nexus-text) / <alpha-value>)',
          textSecondary: 'rgb(var(--nexus-muted) / <alpha-value>)',
          muted: 'rgb(var(--nexus-muted) / <alpha-value>)',
          border: 'rgb(var(--nexus-border) / <alpha-value>)',
          success: 'rgb(var(--nexus-success) / <alpha-value>)',
          warning: 'rgb(var(--nexus-gold) / <alpha-value>)',
          error: 'rgb(var(--nexus-error) / <alpha-value>)',
          info: 'rgb(var(--nexus-info) / <alpha-value>)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },

      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'card': '12px',
        'btn': '12px',
      },

      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'glow': '0 0 20px rgba(255, 106, 0, 0.15)',
        'glass': '0 8px 32px rgba(0,0,0,.35)',
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },

      backgroundImage: {
        'gradient-cinematic': 'linear-gradient(to bottom right, #131930, #252A40)',
        'gradient-brand': 'linear-gradient(90deg, #FB461D, #FC6A48, #F7A321)',
        'gradient-dark': 'linear-gradient(180deg, #131930, #252A40)',
        'gradient-hero': 'linear-gradient(135deg, #131930, #252A40, #FB461D)',
      },

      // ── Min-height with svh for mobile browser chrome ──
      minHeight: {
        'screen-svh': '100svh',
      },

      // ── Spacing: safe-area aware ────────────────────────
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-right':  'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
      },
    },
  },
  plugins: [],
};
