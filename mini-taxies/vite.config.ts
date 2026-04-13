import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
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
      // Any request starting with /api will be forwarded to the real server
      '/api': {
        target: 'https://aqaariq.com',
        changeOrigin: true,
        secure: false, // skip SSL verification for dev if the target has cert issues
        rewrite: (path: string) => path.replace(/^\/api/, '/marketplace/api/v1'),
      },
  }
})
