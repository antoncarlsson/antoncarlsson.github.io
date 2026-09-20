import { describe, expect, it } from 'vitest'
import { createProjectPreview } from './project-preview.service'

describe('project preview rules', () => {
  it('normalizes a readable name, URL slug, and summary without changing its input', () => {
    const input = Object.freeze({
      name: '  Café   Notes! ',
      description: 'A home\nfor useful ideas.',
    })
    expect(createProjectPreview(input)).toEqual({
      ok: true,
      preview: { name: 'Café Notes!', slug: 'cafe-notes', summary: 'A home for useful ideas.' },
    })
    expect(input.name).toBe('  Café   Notes! ')
  })
  it.each(['admin', 'API', ' Auth ', 'login', 'support'])('rejects reserved name %s', (name) => {
    expect(createProjectPreview({ name, description: 'A useful new project.' })).toMatchObject({
      ok: false,
      code: 'RESERVED_NAME',
    })
  })
  it('explains names that cannot produce the documented ASCII slug', () => {
    expect(
      createProjectPreview({ name: '🌲🌿', description: 'A useful new project.' }),
    ).toMatchObject({ ok: false, code: 'EMPTY_SLUG' })
  })
  it('does not accidentally reserve prefixes', () => {
    expect(
      createProjectPreview({ name: 'Admin handbook', description: 'A useful new project.' }).ok,
    ).toBe(true)
  })
})
