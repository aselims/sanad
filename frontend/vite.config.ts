import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    cors: {
      origin: ['http://sanad.selimsalman.de', 'https://sanad.selimsalman.de', 'http://localhost:8081'],
      credentials: true
    }
  }
});
