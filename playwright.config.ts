import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  retries: 1,
  testDir: 'tests',
  reporter: [['list']]
  , use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start -p 3000',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});


