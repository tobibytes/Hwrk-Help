import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@ui': '../../packages/talvra-ui/src/index.ts',
      '@hooks': '../../packages/talvra-hooks/src/index.ts',
      '@constants': '../../packages/talvra-constants/src/index.ts',
      '@routes': '../../packages/talvra-routes/src/index.ts',
      '@api': '../../packages/talvra-api/src/index.ts',
    },
  },
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
