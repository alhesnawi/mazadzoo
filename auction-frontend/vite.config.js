import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const codespaceName = process.env.CODESPACE_NAME
const codespaceHost = codespaceName ? `${codespaceName}-5173.app.github.dev` : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Use a different port than the backend to avoid clashes
    port: 5173,
    host: true,
    allowedHosts: true,
    hmr: codespaceHost
      ? {
          host: codespaceHost,
          protocol: 'https',
          clientPort: 443,
          port: 5173,
        }
      : undefined,
    proxy: {
      '/api': {
        // Proxy API calls to the backend dev server
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        // Ensure Authorization header is forwarded from the browser to the backend
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers && req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (req.headers && req.headers.authorization) {
              proxyRes.setHeader('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            }
          });
        }
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  define: {
    'process.env': {}
  }
})
