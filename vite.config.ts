import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Elasticsearch configuration from environment variables
  const esHost = env.VITE_ES_HOST || 'https://localhost:9200'
  const esUsername = env.VITE_ES_USERNAME || ''
  const esPassword = env.VITE_ES_PASSWORD || ''

  // Helper to create proxy config with auth
  const createEsProxy = (pathRewrite: RegExp): ProxyOptions => ({
    target: esHost,
    changeOrigin: true,
    secure: false, // Allow self-signed certificates
    rewrite: (path) => path.replace(pathRewrite, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        // Add basic auth header if credentials are provided
        if (esUsername && esPassword) {
          const auth = Buffer.from(`${esUsername}:${esPassword}`).toString('base64');
          proxyReq.setHeader('Authorization', `Basic ${auth}`);
        }
      });
    },
  })

  // Shared proxy configuration for both dev and preview servers
  const proxyConfig: Record<string, ProxyOptions> = {
    '/es': createEsProxy(/^\/es/),
    '/api/es-proxy': createEsProxy(/^\/api\/es-proxy/),
  }
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: proxyConfig,
    },
    preview: {
      proxy: proxyConfig,
    },
  }
})
