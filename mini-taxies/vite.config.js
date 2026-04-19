import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import https from 'node:https';

/** اتصال ثابت نحو الـ upstream يقلّل أخطاء عشوائية/502 مع nginx */
const upstreamHttpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 64,
  maxFreeSockets: 16,
});

export default defineConfig({
  plugins: [svelte()],
  server: {
    allowedHosts: [
      '3xzzm8o5qtg2.share.zrok.io',
      'gb8hiofraifk.share.zrok.io',
      '0on5m2tmvvh8.share.zrok.io',
      '3rswekn3t4ux.share.zrok.io',
    ],
    proxy: {
      '/api': {
        target: 'https://aqaariq.com',
        changeOrigin: true,
        secure: true,
        agent: upstreamHttpsAgent,
        timeout: 120000,
        proxyTimeout: 120000,
        rewrite: (path) => path.replace(/^\/api/, '/marketplace/api/v1'),
        configure: (proxy) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[vite proxy] upstream error:', err?.message || err);
          });
          /**
           * تطبيع المسار + سلسلة الاستعلام (بما فيها UTF-8 المرمّزة) قبل إرسالها لـ nginx.
           * يتجنّب بعض حالات 502 عندما يفقد http-proxy ترميز الاستعلام بشكل صحيح.
           */
          proxy.on('proxyReq', (proxyReq, req) => {
            try {
              const raw = req.url || '/';
              const u = new URL(raw, 'http://127.0.0.1');
              let pathAndQuery = u.pathname + u.search;
              if (pathAndQuery.startsWith('/api')) {
                pathAndQuery = pathAndQuery.replace(/^\/api/, '/marketplace/api/v1');
              }
              proxyReq.path = pathAndQuery;
            } catch (e) {
              console.warn('[vite proxy] path normalize skipped:', e);
            }
          });
        },
      },
    },
  },
});
