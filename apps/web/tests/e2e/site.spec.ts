import { expect, test } from '@playwright/test'

test('public navigation, empty collections and metadata', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Anton Carlsson')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Building things.')
  await page.getByRole('navigation').getByRole('link', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects')
  await expect(page.getByText('Good things take a little building.')).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Writing' }).click()
  await expect(page.getByText('A fresh page.')).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello, I’m Anton')
  await page.reload()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://antoncarlsson.github.io/about/',
  )
  expect(errors).toEqual([])
})
test('static HTML is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Building things.')
  await page.getByRole('navigation').getByRole('link', { name: 'Writing' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Writing')
  await context.close()
})
test('missing paths and drafts return true 404s', async ({ page, request }) => {
  for (const path of ['/missing-page/', '/blog/missing/', '/blog/markdown-notes/', '/api/health']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain('This page doesn’t exist.')
  }
  const response = await page.goto('/missing-page/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page doesn’t exist.')
})
test('feeds, sitemap and assets exist', async ({ request }) => {
  for (const path of ['/rss.xml', '/sitemap.xml', '/robots.txt', '/favicon.svg'])
    expect((await request.get(path)).status()).toBe(200)
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('markdown-notes')
})
test('mobile layout, dark mode and keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main-content$/)
  await page.getByRole('navigation').getByRole('link', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects')
})
