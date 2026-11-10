import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor_pdf';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor_react';
          }
          if (id.includes('@supabase')) {
            return 'vendor_supabase';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
