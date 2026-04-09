import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      // Phase 2: Yjs + Tiptap are lazy-loaded and NOT in the main bundle for Phase 1.
      // y-protocols has a broken package.json exports, so we exclude it from bundling.
      external: ['y-protocols'],
      output: {
        // Keep TanStack Query in its own chunk for optimal caching
        manualChunks: {
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
