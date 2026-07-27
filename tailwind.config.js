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
        primary: '#FF6B57',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        accent: '#FDBF50',
        'off-white': '#F4F4F8',
        'dark-navy': '#111827',
        'dark-bg': '#070B1A',
        'dark-surface': '#111827',
        'muted-text': '#64748B',
      },

      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },

      borderRadius: {
        'sm': '12px',
        'md': '18px', // Updated to 18px per requirements
        'lg': '24px',
      },

      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 107, 87, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },

      backgroundImage: {
        'gradient-cinematic': 'linear-gradient(to bottom right, #070B1A, #111827)',
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
