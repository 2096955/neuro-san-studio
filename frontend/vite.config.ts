import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Asset base path. Cloud Run image is built with `--base=/v2/` so the
  // production bundle's `<script src="/v2/assets/...">` resolves against
  // Flask's `/v2/<path:subpath>` route. Dev (`npm run dev`) uses '/'.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Manual chunk-splitting was causing `React.createContext` to be undefined
    // at runtime: consumers landed in a chunk that imported React from
    // `vendor-react`, but Rollup's hoisting was inconsistent and some chunks
    // got React=undefined. Letting Rollup do default chunking is slower to
    // hot-load but correct. Revisit later if bundle size becomes a problem.
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Allow external connections for custom domain mapping
    cors: true,
    allowedHosts: ['trust.cognizant.cloud', 'localhost']
  }
});
