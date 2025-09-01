import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow loading .env files from the monorepo frontend root instead of only this package dir
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      // Specific lovable aliases first so they win over generic '@'
      '@/components/ui': path.resolve(__dirname, './src/lovable/components/ui'),
      '@/components/layout': path.resolve(__dirname, './src/lovable/components/layout'),
      '@/hooks': path.resolve(__dirname, './src/lovable/hooks'),
      '@/lib': path.resolve(__dirname, './src/lovable/lib'),

      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, '../packages/talvra-ui/src'),
      '@hooks': path.resolve(__dirname, '../packages/talvra-hooks/src'),
      '@routes': path.resolve(__dirname, '../packages/talvra-routes/src'),
      '@api': path.resolve(__dirname, '../packages/talvra-api/src'),
      '@constants': path.resolve(__dirname, '../packages/talvra-constants/src'),
    },
  },
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
