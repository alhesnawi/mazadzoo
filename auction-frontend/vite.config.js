import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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
    proxy: {
      '/api': {
        // Proxy API calls to the backend dev server
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Ensure Authorization header is forwarded from the browser to the backend
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers && req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
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
