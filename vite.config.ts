import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Hardcoding the provided key to ensure it "saves" and works perfectly on Vercel
    'process.env.API_KEY': JSON.stringify('AIzaSyCe5lbIyobYVKmuxkVirTbChSlEP9HB4C8')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@google/genai']
        }
      }
    }
  }
});