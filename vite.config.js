import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fh': {
        target: 'https://finnhub.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fh/, ''),
      },
    },
  },
});
