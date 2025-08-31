import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  optimizeDeps: {
    include: ['axios']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // frontend 5173 → backend 3000
    }
  }
})

