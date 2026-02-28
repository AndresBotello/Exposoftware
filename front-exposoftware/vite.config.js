import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mtfr4g8e3k.execute-api.us-east-2.amazonaws.com',
        changeOrigin: true,
        secure: false,
        autoRewrite: true,
        protocolRewrite: 'http',
        followRedirects: true,
      },
    },
  },
})
