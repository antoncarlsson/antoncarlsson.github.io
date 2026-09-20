import { z } from 'zod'

export const publicEnvSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).max(80).default('AWesome Template'),
})

export function parseEnvironment<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))]
    throw new Error(`Invalid environment configuration: ${keys.join(', ')}`)
  }
  return result.data
}
