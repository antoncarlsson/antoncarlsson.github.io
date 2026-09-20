import { Link } from '@tanstack/react-router'
import { entries } from 'virtual:content'
import type { ContentMeta } from '../content.schema'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
export function ContentList({
  kind,
  featured = false,
  limit,
}: {
  kind: 'blog' | 'projects'
  featured?: boolean
  limit?: number
}) {
  const selected = entries
    .filter(
      (entry) =>
        entry.kind === kind && (!featured || (entry.kind === 'projects' && entry.featured)),
    )
    .slice(0, limit)
  if (!selected.length)
    return (
      <div className="empty-state">
        <span className="empty-symbol" aria-hidden="true">
          {kind === 'projects' ? '[ + ]' : '// …'}
        </span>
        <div>
          <h3>{kind === 'projects' ? 'Good things take a little building.' : 'A fresh page.'}</h3>
          <p>
            {kind === 'projects'
              ? 'Projects will appear here as I share them.'
              : 'Notes and ideas will find their home here soon.'}
          </p>
        </div>
      </div>
    )
  return (
    <div className={kind === 'projects' ? 'project-grid' : 'post-list'}>
      {selected.map((entry) => (
        <ContentCard key={entry.path} entry={entry} />
      ))}
    </div>
  )
}
function ContentCard({ entry }: { entry: ContentMeta }) {
  return (
    <article className="content-card">
      <p className="eyebrow">
        {entry.draft
          ? 'Draft / local preview'
          : entry.kind === 'blog'
            ? formatDate(entry.date)
            : 'Project'}
      </p>
      <h3>
        <Link
          to={entry.kind === 'blog' ? '/blog/$slug' : '/projects/$slug'}
          params={{ slug: entry.slug }}
        >
          {entry.title}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </h3>
      <p>{entry.description}</p>
      {entry.kind === 'projects' && (
        <ul className="tags" aria-label="Technologies">
          {entry.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
