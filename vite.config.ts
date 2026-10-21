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
          // Manual chunking: split vendor libs from app code for better caching
          manualChunks: {
            // React runtime — changes rarely, cached long-term by browsers
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI Icons library
            'vendor-icons': ['lucide-react'],
          },
        },
      },
      // Enable source maps only in development
      sourcemap: process.env.NODE_ENV !== 'production',
      // Minify for smallest possible production output
      minify: 'esbuild' as const,
    },

    // Optimize deps for faster dev startup
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },
  };
});
