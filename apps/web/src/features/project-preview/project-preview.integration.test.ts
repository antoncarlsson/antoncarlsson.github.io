import { expect, it } from 'vitest'
import { projectPreviewSchema } from './project-preview.schema'
import { createProjectPreview } from './project-preview.service'

it('composes validated input with domain policy and a JSON-safe result', () => {
  const rawInput: unknown = JSON.parse(
    '{"name":"  Field Notes  ","description":"A home for useful ideas."}',
  )
  const result = createProjectPreview(projectPreviewSchema.parse(rawInput))
  expect(JSON.parse(JSON.stringify(result))).toEqual({
    ok: true,
    preview: { name: 'Field Notes', slug: 'field-notes', summary: 'A home for useful ideas.' },
  })
})

it('distinguishes structurally valid input from a domain rejection', () => {
  const input = projectPreviewSchema.parse({
    name: 'Admin',
    description: 'A home for useful ideas.',
  })
  expect(createProjectPreview(input)).toMatchObject({ ok: false, code: 'RESERVED_NAME' })
})
