import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import graphql from '@rollup/plugin-graphql'

export default defineConfig({
  plugins: [vue(), graphql()],
  test: {
    include: ['tests/**/?(*.)+(spec|test).+(ts|tsx|js)'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**',
    ],
    globals: true,
    environment: 'jsdom',
    alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.runtime.common.js' }],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '~': resolve(__dirname, './'),
    },
  },
})
