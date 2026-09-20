import type { ProjectPreviewInput } from './project-preview.schema'

export type ProjectPreviewResult =
  | { ok: true; preview: { name: string; slug: string; summary: string } }
  | { ok: false; code: 'RESERVED_NAME' | 'EMPTY_SLUG'; message: string }

const reservedSlugs = new Set(['admin', 'api', 'auth', 'login', 'support'])

export function createProjectPreview(input: ProjectPreviewInput): ProjectPreviewResult {
  const name = input.name.trim().replace(/\s+/g, ' ')
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug)
    return {
      ok: false,
      code: 'EMPTY_SLUG',
      message: 'Include at least one Latin letter or number in the project name.',
    }
  if (reservedSlugs.has(slug))
    return {
      ok: false,
      code: 'RESERVED_NAME',
      message: 'That name is reserved. Try a different project name.',
    }

  return {
    ok: true,
    preview: { name, slug, summary: input.description.trim().replace(/\s+/g, ' ') },
  }
}
