import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/project-preview')
})

test('previews validated input through the real server function', async ({ page }) => {
  await page.getByLabel('Project name').fill('Café Notes')
  await page.getByLabel('What are you building?').fill('A shared home for useful ideas.')
  await page.getByRole('button', { name: 'Create preview' }).click()
  const preview = page.getByRole('complementary', { name: 'Project preview' })
  await expect(preview.getByRole('heading', { name: 'Café Notes' })).toBeVisible()
  await expect(preview).toContainText('/cafe-notes')
  await expect(page.getByText('Nothing is saved.')).toBeVisible()
})

test('explains invalid fields without submitting a request', async ({ page }) => {
  let calls = 0
  page.on('request', (request) => {
    if (request.url().includes('/_serverFn/')) calls++
  })
  await page.getByRole('button', { name: 'Create preview' }).click()
  await expect(page.getByText('Use at least 2 characters.')).toBeVisible()
  await expect(page.getByLabel('Project name')).toHaveAttribute('aria-invalid', 'true')
  expect(calls).toBe(0)
})

test('shows a server-side domain rejection', async ({ page }) => {
  await page.getByLabel('Project name').fill('Admin')
  await page.getByLabel('What are you building?').fill('A shared home for useful ideas.')
  await page.getByRole('button', { name: 'Create preview' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'That name is reserved. Try a different project name.',
  )
})

test('recovers from a failed request without exposing internals', async ({ page }) => {
  await page.route('**/_serverFn/**', (route) => route.abort('failed'))
  await page.getByLabel('Project name').fill('Field Notes')
  await page.getByLabel('What are you building?').fill('A shared home for useful ideas.')
  await page.getByRole('button', { name: 'Create preview' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'We couldn’t create your preview. Please try again.',
  )
  await expect(page.getByRole('button', { name: 'Create preview' })).toBeEnabled()
  await page.unroute('**/_serverFn/**')
  await page.getByRole('button', { name: 'Create preview' }).click()
  await expect(page.getByRole('complementary', { name: 'Project preview' })).toContainText(
    '/field-notes',
  )
})

test('keeps a maximum-length unbroken name inside the mobile preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('Project name').fill('A'.repeat(60))
  await page.getByLabel('What are you building?').fill('A shared home for useful ideas.')
  await page.getByRole('button', { name: 'Create preview' }).click()
  await expect(page.getByRole('complementary', { name: 'Project preview' })).toContainText(
    '/' + 'a'.repeat(60),
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
