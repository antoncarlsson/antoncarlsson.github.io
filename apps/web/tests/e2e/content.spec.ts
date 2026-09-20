import { expect, test } from '@playwright/test'

test('Markdown deep links, code, tables, anchors and images', async ({ page }) => {
  const response = await page.goto('/blog/markdown-fixture/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Markdown fixture')
  await expect(page.locator('pre code')).toContainText('<script>never execute</script>')
  expect(await page.locator('pre .th-keyword').count()).toBeGreaterThan(0)
  await expect(page.getByRole('table')).toContainText('Supported')
  await expect(page.locator('h2[id]')).toHaveAttribute('id', 'code-and-tables')
  expect(
    await page
      .getByRole('img', { name: 'Notebook icon' })
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBe(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Markdown fixture')
})
test('MDX is prerendered and hydrates interactive components', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto('/blog/mdx-fixture/')
  expect(await response?.text()).toContain('Compiled with MDX.')
  await expect(page.getByRole('button', { name: 'Count: 0' })).toBeVisible()
  await page.getByRole('button', { name: 'Count: 0' }).click()
  await expect(page.getByRole('button', { name: 'Count: 1' })).toBeVisible()
  await expect(page.locator('h2 a')).toHaveAttribute('href', '#interactive-content')
  await expect(page.locator('pre').last()).toContainText('<script>not executable</script>')
  expect(await page.locator('pre span[class*="th-"]').count()).toBeGreaterThan(0)
  await page.getByRole('link', { name: 'Back to Markdown' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Markdown fixture')
  expect(errors).toEqual([])
})
test('published lists, projects, feeds and excluded drafts', async ({ page, request }) => {
  await page.goto('/blog/')
  await expect(page.locator('.content-card h3').first()).toContainText('MDX fixture')
  await page.goto('/projects/project-fixture/')
  await expect(page.getByRole('link', { name: 'Source code' })).toHaveAttribute(
    'href',
    'https://github.com/TanStack/markdown',
  )
  expect((await request.get('/blog/excluded-draft/')).status()).toBe(404)
  expect(await (await request.get('/rss.xml')).text()).toContain('MDX fixture')
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/projects/project-fixture/')
})
