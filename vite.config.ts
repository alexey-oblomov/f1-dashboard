/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Must match repo name: https://github.com/alexey-oblomov/f1-dashboard */
export const GH_PAGES_BASE = '/f1-dashboard/'

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  preview: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
