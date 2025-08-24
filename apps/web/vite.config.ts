import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@ui': '../../packages/talvra-ui/src/index.ts',
      '@hooks': '../../packages/talvra-hooks/src',
      '@constants': '../../packages/talvra-constants/src',
      '@routes': '../../packages/talvra-routes/src',
      '@api': '../../packages/talvra-api/src',
    },
  },
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
