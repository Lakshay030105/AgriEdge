import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      includeAssets: ['favicon.svg', 'favicon.ico', 'models/**/*.json', 'models/**/*.bin'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html'
      },
      manifest: {
        name: 'AgriEdge Diagnostics',
        short_name: 'AgriEdge',
        description: 'Offline-First Crop Health Intelligence',
        theme_color: '#121816',
        background_color: '#121816',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});