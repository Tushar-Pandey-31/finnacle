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
      '/cmc': {
        target: 'https://pro-api.coinmarketcap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cmc/, ''),
      },
      '/fx': {
        target: 'https://api.forexrateapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fx/, ''),
      },
    },
  },
});
