import '@tanstack/react-start/server-only'
import { AsyncLocalStorage } from 'node:async_hooks'
import { performance } from 'node:perf_hooks'
import { context, metrics, SpanStatusCode, trace } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import pino from 'pino'
import { getServerEnv } from '../env/server'

type RequestContext = { requestId: string }
const requestContext = new AsyncLocalStorage<RequestContext>()
const flushTimeoutMillis = 1_000
const knownMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])

type Observability = {
  logger: pino.Logger
  count: ReturnType<ReturnType<typeof metrics.getMeter>['createCounter']>
  duration: ReturnType<ReturnType<typeof metrics.getMeter>['createHistogram']>
  flush: () => Promise<void>
}

let observability: Observability | undefined

const severity: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
}

function createObservability(): Observability {
  const env = getServerEnv()
  let flush = async () => {}
  let otlpLogWrite: ((line: string) => void) | undefined

  if (env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ timeoutMillis: flushTimeoutMillis }),
      exportIntervalMillis: 60_000,
      exportTimeoutMillis: 5_000,
    })
    const spanProcessor = new BatchSpanProcessor(
      new OTLPTraceExporter({ timeoutMillis: flushTimeoutMillis }),
      {
        exportTimeoutMillis: flushTimeoutMillis,
      },
    )
    const logProcessor = new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter({ timeoutMillis: flushTimeoutMillis }),
      exportTimeoutMillis: flushTimeoutMillis,
    })
    const sdk = new NodeSDK({
      serviceName: env.OTEL_SERVICE_NAME,
      metricReaders: [metricReader],
      spanProcessors: [spanProcessor],
      logRecordProcessors: [logProcessor],
    })
    sdk.start()
    const otelLogger = logs.getLogger('web')
    otlpLogWrite = (line) => {
      try {
        const record = JSON.parse(line) as Record<string, unknown>
        const attributes: Record<string, string | number> = {}
        for (const key of [
          'request_id',
          'reference',
          'kind',
          'method',
          'status_code',
          'duration_ms',
        ]) {
          const value = record[key]
          if (typeof value === 'string' || typeof value === 'number') attributes[key] = value
        }
        otelLogger.emit({
          body: typeof record.msg === 'string' ? record.msg : '',
          severityNumber: severity[Number(record.level)] ?? SeverityNumber.INFO,
          attributes,
          context: context.active(),
        })
      } catch {
        // Logging must never affect an application request.
      }
    }
    flush = async () => {
      const exports = Promise.allSettled([
        metricReader.forceFlush({ timeoutMillis: flushTimeoutMillis }),
        spanProcessor.forceFlush(),
        logProcessor.forceFlush(),
      ])
      let timeout: NodeJS.Timeout | undefined
      const results = await Promise.race([
        exports,
        new Promise<null>((resolve) => {
          timeout = setTimeout(() => resolve(null), flushTimeoutMillis)
        }),
      ])
      if (timeout) clearTimeout(timeout)
      if (results === null || results.some((result) => result.status === 'rejected')) {
        process.stderr.write('Telemetry export failed\n')
      }
    }
    if (!process.env.VERCEL) {
      process.once('SIGTERM', () => {
        void sdk.shutdown()
      })
    }
  }

  const streams: pino.StreamEntry[] = [{ stream: process.stdout }]
  if (otlpLogWrite) streams.push({ stream: { write: otlpLogWrite } })
  const logger = pino(
    {
      level: env.LOG_LEVEL,
      base: { service: env.OTEL_SERVICE_NAME },
      mixin: () => {
        const spanContext = trace.getSpan(context.active())?.spanContext()
        return {
          request_id: requestContext.getStore()?.requestId,
          ...(spanContext && {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          }),
        }
      },
      redact: {
        paths: [
          'password',
          'token',
          'secret',
          'authorization',
          'cookie',
          'headers.authorization',
          'headers.cookie',
          'req.headers.authorization',
          'req.headers.cookie',
        ],
        censor: '[Redacted]',
      },
    },
    pino.multistream(streams),
  )
  const meter = metrics.getMeter('web')
  return {
    logger,
    count: meter.createCounter('http.server.request.count', {
      description: 'Completed HTTP requests',
    }),
    duration: meter.createHistogram('http.server.request.duration', {
      description: 'HTTP request duration',
      unit: 'ms',
    }),
    flush,
  }
}

function getObservability(): Observability {
  return (observability ??= createObservability())
}

export function getLogger() {
  return getObservability().logger
}

export async function observeRequest(
  request: Request,
  handle: () => Promise<Response>,
): Promise<Response> {
  const telemetry = getObservability()
  const requestId = crypto.randomUUID()
  const started = performance.now()
  const method = knownMethods.has(request.method) ? request.method : 'OTHER'
  const tracer = trace.getTracer('web')
  return requestContext.run({ requestId }, () =>
    tracer.startActiveSpan('HTTP request', async (span) => {
      let status = 500
      try {
        const response = await handle()
        status = response.status
        if (status >= 500) span.setStatus({ code: SpanStatusCode.ERROR })
        const headers = new Headers(response.headers)
        headers.set('X-Request-ID', requestId)
        return new Response(response.body, {
          status,
          statusText: response.statusText,
          headers,
        })
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR })
        telemetry.logger.error(
          { kind: error instanceof Error ? 'Error' : 'Unknown' },
          'Request failed',
        )
        return new Response('Internal server error', {
          status: 500,
          headers: { 'X-Request-ID': requestId },
        })
      } finally {
        const durationMs = performance.now() - started
        const attributes = { method, status_class: `${Math.floor(status / 100)}xx` }
        telemetry.count.add(1, attributes)
        telemetry.duration.record(durationMs, attributes)
        span.setAttribute('http.request.method', method)
        span.setAttribute('http.response.status_code', status)
        span.end()
        telemetry.logger.info(
          { method, status_code: status, duration_ms: Math.round(durationMs) },
          'Request completed',
        )
        if (process.env.VERCEL && getServerEnv().OTEL_EXPORTER_OTLP_ENDPOINT) {
          try {
            await telemetry.flush()
          } catch {
            process.stderr.write('Telemetry flush failed\n')
          }
        }
      }
    }),
  )
}
