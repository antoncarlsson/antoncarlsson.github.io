import { defineConfig, devices } from '@playwright/test'

const sitePort = process.env.E2E_SITE_PORT ?? '4173'
const fixturePort = process.env.E2E_FIXTURE_PORT ?? '4174'

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
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${sitePort}` },
    },
    {
      name: 'content-fixtures',
      testMatch: 'content.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${fixturePort}` },
    },
  ],
  webServer: [
    {
      command: 'node scripts/serve-static.mjs .output/public',
      url: `http://127.0.0.1:${sitePort}`,
      reuseExistingServer: false,
      env: { PORT: sitePort },
    },
    {
      command: 'node scripts/serve-static.mjs .output-fixtures/public',
      url: `http://127.0.0.1:${fixturePort}`,
      reuseExistingServer: false,
      env: { PORT: fixturePort },
    },
  ],
})
