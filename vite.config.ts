import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Babel plugins pour performance
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],

  resolve: {
    alias: {
      '@':           resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@services':   resolve(__dirname, 'src/services'),
      '@context':    resolve(__dirname, 'src/context'),
      '@data':       resolve(__dirname, 'src/data'),
      '@utils':      resolve(__dirname, 'src/utils'),
      '@types':      resolve(__dirname, 'src/types'),
      '@assets':     resolve(__dirname, 'src/assets'),
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Code splitting par domaine
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'query-vendor':  ['@tanstack/react-query'],
          'chart-vendor':  ['recharts'],
          'utils-vendor':  ['axios', 'zustand', 'date-fns'],
          'pages-admin':   [
            './src/pages/admin/AdminDashboardPage',
            './src/pages/admin/AdminMembersPage',
            './src/pages/admin/AdminKycPage',
            './src/pages/admin/AdminInvestPage',
          ],
          'pages-member':  [
            './src/pages/member/DashboardPage',
            './src/pages/member/PortfolioPage',
            './src/pages/member/InvestirPage',
          ],
        },
      },
    },
    // Seuil d'avertissement chunk à 800kb
    chunkSizeWarningLimit: 800,
  },

  preview: {
    port: 4173,
    host: true,
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
