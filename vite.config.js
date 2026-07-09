import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['icon-192x192.svg', 'icon-512x512.svg'],
      manifest: {
        name: 'ZTracker',
        short_name: 'ZTracker',
        description: 'Phần mềm quản lý đơn hàng ZTracker',
        theme_color: '#10b981',
        background_color: '#f5f5f4',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
