import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,   // lets us use vi / expect without import
    root: '.',       // resolve paths from repo root
    clearMocks: true,
    include: ['**/__tests__/**/*.test.js']  // ensure test files are matched
  }
})
