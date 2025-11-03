import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/projects': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/invitations': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/cohorts': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/classes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/tasks': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/members': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
