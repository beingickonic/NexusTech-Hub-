import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import process from 'node:process';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

let buildCommit = process.env.GITHUB_SHA?.slice(0, 7);
if (!buildCommit) {
  try {
    buildCommit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (err) {
    buildCommit = 'local';
  }
}
const buildTimestamp = new Date().toISOString();

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'NexusTech Hub',
        short_name: 'NexusTech',
        description: 'Your ultimate destination for premium tech gear.',
        theme_color: '#FF724C',
        background_color: '#F8FAFC',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  
  // REQUIRED for Capacitor WebView:
  // All asset paths must be relative so they work when loaded from
  // the Android WebView's file:// context.
  base: './',

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
});
