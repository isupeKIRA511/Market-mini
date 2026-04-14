import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

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
            // تحسين البروكسي ليكون أكثر دقة
            '/api': {
                target: 'https://aqaariq.com',
                changeOrigin: true,
                secure: true, // يفضل تفعيلها لأن السيرفر يستخدم https
                // تأكد أن المسار النهائي يصبح: https://aqaariq.com/marketplace/api/v1/...
                rewrite: (path) => path.replace(/^\/api/, '/marketplace/api/v1'),
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        }
    }
})