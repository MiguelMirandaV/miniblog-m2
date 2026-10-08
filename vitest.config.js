import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    restoreMocks: true,
    testTimeout: 10000,
    hookTimeout: 15000,
  },
});
