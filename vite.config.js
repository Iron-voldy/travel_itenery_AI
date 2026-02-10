import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/webhook-test': {
        target: 'https://aahaas-ai.app.n8n.cloud',
        changeOrigin: true,
        secure: false,
      },
      '/webhook': {
        target: 'https://aahaas-ai.app.n8n.cloud',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
