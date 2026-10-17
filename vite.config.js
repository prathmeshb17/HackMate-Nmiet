import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api/devpost': {
        target: 'https://devpost.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/devpost/, '/api/hackathons'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      },
      '/api/unstop': {
        target: 'https://unstop.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/unstop/, '/api/public/opportunity/search-result'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      }
    }
  }
});
