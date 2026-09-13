import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    fileParallelism: false, // Run test files sequentially since they share a DB
    poolOptions: {
      threads: {
        singleThread: true // Disable threading to avoid connection pooling issues
      }
    }
  },
});
