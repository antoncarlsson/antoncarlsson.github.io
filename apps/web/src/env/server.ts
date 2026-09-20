import '@tanstack/react-start/server-only'
import { parseEnvironment } from './schema'
import { serverEnvSchema } from './server-schema.server'

export function getServerEnv() {
  return parseEnvironment(serverEnvSchema, {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    APP_ORIGIN: process.env.APP_ORIGIN,
  })
}
