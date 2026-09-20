import '@tanstack/react-start/server-only'
import { getLogger } from './observability.server'

export function reportUnexpectedError(error: unknown): string {
  const reference = crypto.randomUUID()
  // Error messages, stacks and request payloads may contain secrets. Log only safe metadata.
  getLogger().error(
    {
      reference,
      kind: error instanceof Error ? 'Error' : 'Unknown',
    },
    'Unexpected application error',
  )
  return reference
}
