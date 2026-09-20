import { expect, test } from '@playwright/test'

test('returns health and defensive headers on success and errors', async ({ request }) => {
  for (const [path, status] of [
    ['/', 200],
    ['/api/health', 200],
    ['/missing', 404],
  ] as const) {
    const response = await request.get(path)
    expect(response.status()).toBe(status)
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(response.headers()['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  }
  const health = await request.get('/api/health')
  expect(await health.json()).toEqual({ status: 'ok' })
  expect(health.headers()['cache-control']).toBe('no-store')
})

test('validates direct RPC input and rejects cross-origin calls', async ({ page, request }) => {
  await page.goto('/examples/project-preview')
  await page.getByLabel('Project name').fill('Field Notes')
  await page.getByLabel('What are you building?').fill('A shared home for useful ideas.')
  const sent = page.waitForRequest(
    (candidate) => candidate.method() === 'POST' && candidate.url().includes('/_serverFn/'),
  )
  await page.getByRole('button', { name: 'Create preview' }).click()
  const rpc = await sent
  await expect(page.getByRole('complementary', { name: 'Project preview' })).toContainText(
    '/field-notes',
  )
  const headers = { ...rpc.headers() }
  delete headers['content-length']
  // Replay a real compiler-generated call rather than hardcoding a server-function ID.
  const validBody = rpc.postData()
  expect(validBody).toContain('Field Notes')
  const malformedBody = validBody?.replace('Field Notes', '')
  expect(malformedBody).toBeDefined()
  const invalid = await request.post(rpc.url(), { headers, data: malformedBody })
  // Start serializes RPC errors in a successful HTTP response; assert the validation error.
  const invalidResult = await invalid.text()
  expect(invalidResult).toContain('Use at least 2 characters.')
  expect(invalidResult).not.toContain('project-preview.service')
  const crossOrigin = await request.post(rpc.url(), {
    headers: { ...headers, origin: 'https://untrusted.example', 'sec-fetch-site': 'cross-site' },
    data: validBody ?? '',
  })
  expect(crossOrigin.status()).toBe(403)
})
