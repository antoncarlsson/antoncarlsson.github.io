import '@tanstack/react-start/server-only'
import { z } from 'zod'

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
  OTEL_SERVICE_NAME: z.string().trim().min(1).max(80).default('anton-portfolio'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z
    .url()
    .refine((value) => {
      const url = URL.parse(value)
      return url !== null && ['http:', 'https:'].includes(url.protocol)
    }, 'Use an HTTP(S) OTLP endpoint')
    .optional(),
  APP_ORIGIN: z
    .url()
    .refine((value) => {
      const url = URL.parse(value)
      return url !== null && ['http:', 'https:'].includes(url.protocol) && url.origin === value
    }, 'Use an HTTP(S) origin without a path or trailing slash')
    .optional(),
})
