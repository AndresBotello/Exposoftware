import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://expounicesar.duckdns.org',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: { '*': 'localhost' },
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['quill'],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor': ['primereact'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'primereact'],
    exclude: ['quill'],
  },
})