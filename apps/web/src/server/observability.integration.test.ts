import { createServer } from 'node:http'
import { afterAll, expect, it, vi } from 'vitest'
import { getLogger, observeRequest } from './observability.server'

const originalEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
const originalVercel = process.env.VERCEL
const received: Array<{ path: string; body: string; contentType: string }> = []
const server = createServer((request, response) => {
  const chunks: Buffer[] = []
  request.on('data', (chunk: Buffer) => chunks.push(chunk))
  request.on('end', () => {
    received.push({
      path: request.url ?? '',
      body: Buffer.concat(chunks).toString('utf8'),
      contentType: request.headers['content-type'] ?? '',
    })
    response.writeHead(200)
    response.end()
  })
})

afterAll(async () => {
  if (originalEndpoint === undefined) delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  else process.env.OTEL_EXPORTER_OTLP_ENDPOINT = originalEndpoint
  if (originalVercel === undefined) delete process.env.VERCEL
  else process.env.VERCEL = originalVercel
  if (server.listening) {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
})

it('keeps safe Pino logs on stdout and exports correlated logs, metrics, and traces', async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected a TCP address')
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = `http://127.0.0.1:${address.port}`
  process.env.VERCEL = '1'

  const lines: string[] = []
  const write = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    lines.push(String(chunk))
    return true
  })
  try {
    const response = await observeRequest(
      new Request('http://example.test/private?secret=value'),
      async () => {
        getLogger().info({ password: 'do-not-export', kind: 'test' }, 'Safe event')
        return new Response('ok')
      },
    )
    expect(response.status).toBe(200)
    const requestId = response.headers.get('X-Request-ID')
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/)

    const stdout = lines.map((line) => JSON.parse(line) as Record<string, unknown>)
    expect(stdout.some((record) => record.msg === 'Safe event')).toBe(true)
    expect(stdout.every((record) => record.request_id === requestId)).toBe(true)
    expect(stdout.every((record) => typeof record.trace_id === 'string')).toBe(true)
    expect(stdout.every((record) => typeof record.span_id === 'string')).toBe(true)
    expect(new Set(stdout.map((record) => record.trace_id)).size).toBe(1)
    expect(stdout.some((record) => record.password === '[Redacted]')).toBe(true)
    expect(lines.join('')).not.toContain('do-not-export')
    expect(lines.join('')).not.toContain('secret=value')

    expect(received.map((item) => item.path).sort()).toEqual([
      '/v1/logs',
      '/v1/metrics',
      '/v1/traces',
    ])
    expect(received.every((item) => item.contentType.includes('application/x-protobuf'))).toBe(true)
    expect(received.find((item) => item.path === '/v1/logs')?.body).toContain('Safe event')
    expect(received.find((item) => item.path === '/v1/metrics')?.body).toContain(
      'http.server.request.count',
    )
    expect(received.find((item) => item.path === '/v1/traces')?.body).toContain('HTTP request')
    expect(received.map((item) => item.body).join('')).not.toContain('do-not-export')
    expect(received.map((item) => item.body).join('')).not.toContain('secret=value')
  } finally {
    write.mockRestore()
  }
})

it('returns a safe response and stdout log when OTLP is unavailable', async () => {
  server.closeAllConnections()
  await new Promise<void>((resolve) => server.close(() => resolve()))
  const lines: string[] = []
  const write = vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    lines.push(String(chunk))
    return true
  })
  try {
    const response = await observeRequest(new Request('http://example.test/failing'), async () => {
      throw new Error('private failure detail')
    })
    expect(response.status).toBe(500)
    expect(response.headers.get('X-Request-ID')).toBeTruthy()
    expect(lines.join('')).toContain('Request failed')
    expect(lines.join('')).not.toContain('private failure detail')
  } finally {
    write.mockRestore()
  }
}, 15_000)
