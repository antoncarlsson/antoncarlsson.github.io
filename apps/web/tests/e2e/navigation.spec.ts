import { expect, test } from '@playwright/test'

test('renders on the server and navigates without hydration errors', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const response = await request.get('/')
  expect(await response.text()).toContain('Start small.')
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Start small. Build with intent.' })).toBeVisible()
  await page.getByRole('link', { name: 'Explore the example' }).click()
  await expect(page).toHaveURL('/examples/project-preview')
  await expect(page.getByRole('heading', { name: 'Give your idea a shape.' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to overview' }).click()
  await expect(page).toHaveURL('/')
  expect(errors).toEqual([])
})

test('shows a useful not-found page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeVisible()
  await page.getByRole('link', { name: 'Return home' }).click()
  await expect(page).toHaveURL('/')
})

test('fits a small mobile viewport and exposes a keyboard skip link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/project-preview')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  expect(fits).toBe(true)
  await expect(page.getByRole('button', { name: 'Create preview' })).toBeVisible()
})
