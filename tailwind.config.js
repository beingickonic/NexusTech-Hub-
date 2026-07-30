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
        primary: '#FF6B57', // Legacy, keeping for fallback
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        accent: '#FDBF50', // Legacy
        'off-white': '#F4F4F8',
        'dark-navy': '#111827',
        'dark-bg': '#070B1A',
        'dark-surface': '#111827',
        'muted-text': '#64748B',
        
        // Official Nexus Design Tokens
        nexus: {
          primary: '#FF724C',
          secondary: '#FDBF50',
          bg: '#2A2C41',
          surface: '#353756',
          text: '#F4F4F8',
          textSecondary: '#B8BBC7',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          border: 'rgba(255,255,255,0.08)'
        }
      },

      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },

      borderRadius: {
        'sm': '10px',
        'md': '14px',
        'lg': '18px',
      },

      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 107, 87, 0.4)',
        'glass': '0 8px 32px rgba(0,0,0,.35)',
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
