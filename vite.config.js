import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        injectionPoint: undefined // Will not inject precache list into sw.ts to avoid errors if not needed, or we can use it. Let's just allow default injection
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['icon-192x192.svg', 'icon-512x512.svg', 'badge-96x96.svg', 'pwa-192x192.png'],
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
