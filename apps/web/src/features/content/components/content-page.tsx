import { Suspense } from 'react'
import { Link, notFound } from '@tanstack/react-router'
import { entries } from 'virtual:content'
import { mdxComponents } from './mdx-components'
import { formatDate } from './content-list'

export function findEntry(kind: 'blog' | 'projects', slug: string) {
  const entry = entries.find((item) => item.kind === kind && item.slug === slug)
  if (!entry) throw notFound()
  return entry
}
export async function loadEntry(kind: 'blog' | 'projects', slug: string) {
  const entry = findEntry(kind, slug)
  await entry.load()
  // Only serializable public metadata crosses the route loader boundary.
  return { title: entry.title, description: entry.description, path: entry.path }
}
export function ContentPage({ kind, slug }: { kind: 'blog' | 'projects'; slug: string }) {
  const entry = findEntry(kind, slug)
  const Content = entry.Component
  return (
    <article className="article-page">
      <Link className="back-link" to={kind === 'blog' ? '/blog' : '/projects'}>
        ← All {kind === 'blog' ? 'writing' : 'projects'}
      </Link>
      <header className="article-header">
        <p className="eyebrow">
          {entry.kind === 'blog' ? formatDate(entry.date) : 'Project notes'}
        </p>
        {entry.draft && <p className="draft-label">Draft · visible in local preview only</p>}
        <h1>{entry.title}</h1>
        <p className="lede">{entry.description}</p>
        {entry.kind === 'projects' && (
          <>
            <ul className="tags">
              {entry.technologies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="project-links">
              {entry.source && <a href={entry.source}>Source code ↗</a>}
              {entry.demo && <a href={entry.demo}>Live demo ↗</a>}
            </div>
          </>
        )}
      </header>
      <div className="prose">
        <Suspense fallback={<p>Loading content…</p>}>
          <Content components={mdxComponents} />
        </Suspense>
      </div>
    </article>
  )
}
