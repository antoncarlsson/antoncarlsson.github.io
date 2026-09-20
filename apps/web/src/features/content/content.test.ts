import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { renderHtml } from '@tanstack/markdown/html'
import { readContent, staticAssets } from './content-build'
import { highlightMarkdownCode } from './highlight'

const temporary: string[] = []
function collection(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-content-'))
  temporary.push(dir)
  mkdirSync(join(dir, 'blog'))
  mkdirSync(join(dir, 'projects'))
  for (const [name, source] of Object.entries(files)) writeFileSync(join(dir, name), source)
  return dir
}
function post(date = '2026-01-01', extra = 'draft: false') {
  return `---\ntitle: A note\ndescription: A description\ndate: '${date}'\n${extra}\n---\n\n## Hello\n`
}
afterEach(() => {
  for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true })
})
describe('content publishing', () => {
  it('orders posts newest first and keeps drafts local', () => {
    const dir = collection({
      'blog/older.md': post(),
      'blog/newer.mdx': post('2026-02-01'),
      'projects/example.md': '---\ntitle: A project\ndescription: Example\ndraft: false\n---\n',
      'blog/draft.md': post('2026-03-01', 'draft: true'),
    })
    expect(
      readContent(dir, false)
        .filter(({ meta }) => meta.kind === 'blog')
        .map(({ meta }) => meta.slug),
    ).toEqual(['newer', 'older'])
    expect(readContent(dir, true)).toHaveLength(4)
  })
  it('defaults to draft to avoid accidental publication', () => {
    expect(readContent(collection({ 'blog/note.md': post('2026-01-01', '') }), false)).toEqual([])
  })
  it('rejects duplicate filenames across Markdown and MDX', () => {
    expect(() =>
      readContent(collection({ 'blog/note.md': post(), 'blog/note.mdx': post() }), false),
    ).toThrow('Duplicate blog slug')
  })
  it('rejects invalid dates, metadata, slugs and unsafe project URLs', () => {
    for (const source of [
      post('2026-02-30'),
      post().replace('title: A note', 'title: ""'),
      post().replace('draft: false', 'draft: "false"'),
    ]) {
      expect(() => readContent(collection({ 'blog/note.md': source }), false)).toThrow()
    }
    expect(() => readContent(collection({ 'blog/Bad Slug.md': post() }), false)).toThrow(
      'Invalid content slug',
    )
    expect(() =>
      readContent(
        collection({
          'projects/example.md':
            '---\ntitle: Example\ndescription: Example\nsource: javascript:alert(1)\n---\n',
        }),
        false,
      ),
    ).toThrow()
  })
  it('escapes feed values and excludes drafts from discovery files', () => {
    const entries = readContent(
      collection({
        'blog/note.md': post().replace('title: A note', 'title: A & B'),
        'blog/draft.md': post('2026-01-02', 'draft: true'),
      }),
      true,
    )
    const assets = staticAssets(entries, {
      name: 'Anton',
      url: 'https://example.com',
      description: 'Notes',
    })
    expect(assets['rss.xml']).toContain('A &amp; B')
    expect(assets['rss.xml']).not.toContain('/draft/')
    expect(assets['sitemap.xml']).toContain('https://example.com/blog/note/')
    expect(assets['sitemap.xml']).not.toContain('/draft/')
  })
})
it('renders code without executable HTML, preserving text for unknown languages', () => {
  const source = '```unknown\n<script>alert(1)</script>\n```'
  const html = renderHtml(source, { highlighter: highlightMarkdownCode })
  expect(html).toContain('&lt;script&gt;')
  expect(html).not.toContain('<script>')
  expect(
    renderHtml('```ts\nconst x: number = 1\n```', { highlighter: highlightMarkdownCode }),
  ).toContain('th-')
})
