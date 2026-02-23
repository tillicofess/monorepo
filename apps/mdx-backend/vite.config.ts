import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 远程 API 目标
const UMAMI_WEBSITE = 'https://umami.ticscreek.top';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'dev.ticscreek.top',
    port: 5173,

    https: {
      key: path.resolve(__dirname, 'dev.ticscreek.top-key.pem'),
      cert: path.resolve(__dirname, 'dev.ticscreek.top.pem'),
    },

    proxy: {
      '/umami': {
        target: UMAMI_WEBSITE,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/umami/, ''),
      },
      // "/api": {
      //   target: REMOTE_TARGET,
      //   changeOrigin: true,
      //   secure: false,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if ((id.includes('node_modules') && id.endsWith('.js')) || id.endsWith('.ts')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
