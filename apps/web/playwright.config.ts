import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : '50%',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'production',
      testMatch: 'site.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4173' },
    },
    {
      name: 'content-fixtures',
      testMatch: 'content.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4174' },
    },
  ],
  webServer: [
    {
      command: 'node scripts/serve-static.mjs .output/public',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      env: { PORT: '4173' },
    },
    {
      command: 'node scripts/serve-static.mjs .output-fixtures/public',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
      env: { PORT: '4174' },
    },
  ],
})
