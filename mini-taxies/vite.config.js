import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vite config (JS) with dev proxy that rewrites /api -> /marketplace/api/v1
export default defineConfig({
  plugins: [svelte()],
  server: {
    allowedHosts: [
      '3xzzm8o5qtg2.share.zrok.io',
      'gb8hiofraifk.share.zrok.io',
      '0on5m2tmvvh8.share.zrok.io',
      '3rswekn3t4ux.share.zrok.io'
    ],
    proxy: {
      '/api': {
        target: 'https://aqaariq.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/marketplace/api/v1')
      },
      '/swagger': {
        target: 'https://aqaariq.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/swagger/, '/swagger')
      }
    }
  }
})
