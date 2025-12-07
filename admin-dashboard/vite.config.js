import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const codespaceName = process.env.CODESPACE_NAME
const codespaceHost = codespaceName ? `${codespaceName}-5174.app.github.dev` : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    host: true,
    hmr: codespaceHost
      ? {
          host: codespaceHost,
          protocol: 'https',
          clientPort: 443,
          port: 5174,
        }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (req.headers && req.headers.authorization) {
              proxyRes.setHeader('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            }
          });
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
})
