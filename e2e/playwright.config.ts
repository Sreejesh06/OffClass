import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Set test DB URL so we don't wipe the dev database
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/cryptid_test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep it 1 for predictable DB state during E2E tests
  reporter: 'html',
  
  globalSetup: require.resolve('./global.setup.ts'),
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run the backend and frontend dev servers before testing
  // (In a real CI, we might build and run preview instead)
  webServer: [
    {
      command: 'cd ../server && MOCK_MINIO=true pnpm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../client && pnpm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
