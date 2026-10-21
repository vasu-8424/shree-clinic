import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },

    build: {
      // Target modern browsers for smaller, faster bundles
      target: 'es2020',
      // Produce smaller chunks for faster initial load under high concurrency
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Vite 8 (rolldown) requires manualChunks as a FUNCTION, not an object
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
          },
        },
      },
      // Minify for smallest possible production output
      minify: 'esbuild' as const,
    },

    // Optimize deps for faster dev startup
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },
  };
});
