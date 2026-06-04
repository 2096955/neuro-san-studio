import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            if (id.includes('@mui/') || id.includes('@emotion/')) return 'vendor-mui';
            if (id.includes('reactflow') || id.includes('dagre')) return 'vendor-graph';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
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
