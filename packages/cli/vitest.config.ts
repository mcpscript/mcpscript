import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000, // Longer timeout for e2e tests
    hookTimeout: 10000,
    teardownTimeout: 10000,
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      // Exclude E2E tests in CI (they require Ollama and GPU)
      ...(process.env.CI ? ['src/__tests__/e2e/**'] : []),
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
});
