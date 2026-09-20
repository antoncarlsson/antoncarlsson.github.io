import { readdirSync, readFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { parse } from 'yaml'
import { postSchema, projectSchema } from './content.schema'
import type { ContentMeta } from './content.schema'

export type ContentSource = { meta: ContentMeta; filename: string; body: string }
export function frontmatter(source: string, filename: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  if (!match) throw new Error(`${filename}: expected YAML frontmatter`)
  return { data: parse(match[1]!), body: source.slice(match[0].length) }
}
export function readContent(directory: string, includeDrafts: boolean): ContentSource[] {
  const entries: ContentSource[] = []
  for (const kind of ['blog', 'projects'] as const) {
    const seen = new Set<string>()
    for (const file of readdirSync(join(directory, kind)).sort()) {
      if (!/\.mdx?$/.test(file)) continue
      const slug = basename(file, extname(file))
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid content slug: ${file}`)
      if (seen.has(slug)) throw new Error(`Duplicate ${kind} slug: ${slug}`)
      seen.add(slug)
      const filename = join(directory, kind, file)
      const { data, body } = frontmatter(readFileSync(filename, 'utf8'), filename)
      const result = (kind === 'blog' ? postSchema : projectSchema).safeParse(data)
      if (!result.success) throw new Error(`${filename}: ${result.error.message}`)
      const meta = { ...result.data, kind, slug, path: `/${kind}/${slug}` } as ContentMeta
      if (includeDrafts || !meta.draft) entries.push({ meta, filename, body })
    }
  }
  return entries.sort((a, b) => {
    if (a.meta.kind !== b.meta.kind) return a.meta.kind.localeCompare(b.meta.kind)
    if (a.meta.kind === 'blog' && b.meta.kind === 'blog') {
      return b.meta.date.localeCompare(a.meta.date) || a.meta.slug.localeCompare(b.meta.slug)
    }
    return a.meta.title.localeCompare(b.meta.title)
  })
}
export function xml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!,
  )
}
export function staticAssets(
  entries: ContentSource[],
  site: { url: string; name: string; description: string },
) {
  const published = entries.filter(({ meta }) => !meta.draft)
  const paths = [
    '/',
    '/projects/',
    '/blog/',
    '/about/',
    ...published.map(({ meta }) => `${meta.path}/`),
  ]
  return {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xml(site.url + path)}</loc></url>`).join('')}</urlset>`,
    'rss.xml': `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(site.name)}</title><link>${xml(site.url)}/</link><description>${xml(site.description)}</description>${published
      .filter(({ meta }) => meta.kind === 'blog')
      .map(
        ({ meta }) =>
          `<item><title>${xml(meta.title)}</title><link>${xml(site.url + meta.path)}/</link><guid>${xml(site.url + meta.path)}/</guid><description>${xml(meta.description)}</description><pubDate>${new Date(meta.kind === 'blog' ? `${meta.date}T00:00:00Z` : 0).toUTCString()}</pubDate></item>`,
      )
      .join('')}</channel></rss>`,
    'robots.txt': `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
    '.nojekyll': '',
  }
}
