import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Safely handle process.env for both build and runtime
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      // Mark pdfjs-dist as external so Rollup doesn't try to find it locally
      external: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.mjs'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react']
        },
        globals: {
          'pdfjs-dist': 'pdfjsLib'
        }
      }
    }
  },
  optimizeDeps: {
    // Prevent Vite from trying to pre-bundle the external library
    exclude: ['pdfjs-dist']
  }
});