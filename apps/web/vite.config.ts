import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, '../../packages/talvra-ui/src'),
      '@hooks': path.resolve(__dirname, '../../packages/talvra-hooks/src'),
      '@routes': path.resolve(__dirname, '../../packages/talvra-routes/src'),
      '@api': path.resolve(__dirname, '../../packages/talvra-api/src'),
    },
  },
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
