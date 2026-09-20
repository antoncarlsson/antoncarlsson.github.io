import { describe, expect, it } from 'vitest'
import { projectPreviewSchema } from './project-preview.schema'

const validInput = { name: 'Field notes', description: 'A shared home for useful ideas.' }

describe('project preview input', () => {
  it('trims user input', () => {
    expect(projectPreviewSchema.parse({ ...validInput, name: '  Field notes  ' }).name).toBe(
      'Field notes',
    )
  })
  it.each([
    { name: '' },
    { name: 'a' },
    { name: 'a'.repeat(61) },
    { description: 'short' },
    { description: 'a'.repeat(281) },
    { name: 42 },
    { role: 'admin' },
  ])('rejects invalid input or unexpected properties: %j', (patch) => {
    expect(projectPreviewSchema.safeParse({ ...validInput, ...patch }).success).toBe(false)
  })
})
