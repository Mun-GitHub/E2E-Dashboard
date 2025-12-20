import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API requests to OpenSearch/Elasticsearch to avoid CORS issues
      '/es': {
        target: 'https://localhost:9200',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        rewrite: (path) => path.replace(/^\/es/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add basic auth header
            const auth = Buffer.from('admin:admin').toString('base64');
            proxyReq.setHeader('Authorization', `Basic ${auth}`);
          });
        },
      },
    },
  },
})
