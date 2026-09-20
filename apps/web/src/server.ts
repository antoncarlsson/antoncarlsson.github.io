import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import type { RequestHandler } from '@tanstack/react-start/server'
import type { Register } from '@tanstack/react-router'
import { getServerEnv } from './env/server'
import { observeRequest } from './server/observability.server'
import { securityHeaders } from './server/security-headers'

const handleRequest = createStartHandler(defaultStreamHandler)

const fetch: RequestHandler<Register> = async (request, options) => {
  getServerEnv()
  const response = await observeRequest(request, async () => handleRequest(request, options))
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default { fetch }
