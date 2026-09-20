import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

test('public navigation and metadata', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects')
  await page.getByRole('navigation').getByRole('link', { name: 'Writing' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Writing')
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.reload()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://antoncarlsson.github.io/about/',
  )
  expect(errors).toEqual([])
})
test('static HTML is readable without JavaScript', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('Playwright base URL is required')
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Writing' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Writing')
  await context.close()
})
test('missing paths return true 404s', async ({ page, request }) => {
  const missingSlug = `missing-${randomUUID()}`
  for (const path of [
    `/${missingSlug}/`,
    `/blog/${missingSlug}/`,
    `/projects/${missingSlug}/`,
    '/api/health',
  ]) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain('<h1')
  }
  const response = await page.goto(`/${missingSlug}/`)
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
test('feeds, sitemap and assets exist', async ({ request }) => {
  for (const path of ['/rss.xml', '/sitemap.xml', '/robots.txt', '/favicon.svg'])
    expect((await request.get(path)).status()).toBe(200)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/', '/projects/', '/blog/', '/about/'])
    expect(sitemap).toContain(`<loc>https://antoncarlsson.github.io${path}</loc>`)
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
