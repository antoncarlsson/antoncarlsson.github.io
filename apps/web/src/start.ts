import { createCsrfMiddleware, createServerOnlyFn, createStart } from '@tanstack/react-start'
import { getServerEnv } from './env/server'

const isAllowedOrigin = createServerOnlyFn(
  (origin: string, requestUrl: string) =>
    origin === (getServerEnv().APP_ORIGIN ?? new URL(requestUrl).origin),
)

export const startInstance = createStart(() => ({
  requestMiddleware: [
    createCsrfMiddleware({
      filter: (context) => context.handlerType === 'serverFn',
      origin: (origin, context) => isAllowedOrigin(origin, context.request.url),
    }),
  ],
}))
