import { describe, expect, it } from 'vitest'
import { parseEnvironment, publicEnvSchema } from './schema'
import { serverEnvSchema } from './server-schema.server'

describe('environment boundaries', () => {
  it('starts without optional environment configuration', () => {
    expect(parseEnvironment(publicEnvSchema, {})).toEqual({
      VITE_APP_NAME: 'AWesome Template',
    })
    expect(parseEnvironment(serverEnvSchema, {})).toEqual({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      OTEL_SERVICE_NAME: 'workspace-web',
    })
  })

  it('does not copy private or unknown values into public configuration', () => {
    expect(parseEnvironment(publicEnvSchema, { DATABASE_URL: 'private-value' })).not.toHaveProperty(
      'DATABASE_URL',
    )
  })

  it.each(['javascript:alert(1)', 'https://example.com/path', 'https://example.com/'])(
    'rejects non-origin configuration: %s',
    (APP_ORIGIN) => {
      expect(() => parseEnvironment(serverEnvSchema, { APP_ORIGIN })).toThrow('APP_ORIGIN')
    },
  )

  it('reports invalid keys without disclosing their values', () => {
    expect(() => parseEnvironment(serverEnvSchema, { APP_ORIGIN: 'private-secret-value' })).toThrow(
      'Invalid environment configuration: APP_ORIGIN',
    )
    expect(() =>
      parseEnvironment(serverEnvSchema, { OTEL_EXPORTER_OTLP_ENDPOINT: 'private-secret-value' }),
    ).toThrow('Invalid environment configuration: OTEL_EXPORTER_OTLP_ENDPOINT')
  })
})
