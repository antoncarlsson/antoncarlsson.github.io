import { Link } from '@tanstack/react-router'
import { site } from '../config/site'

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-sm text-primary-foreground"
          >
            ts
          </span>
          {site.name}
        </Link>
        <nav aria-label="Main navigation" className="flex gap-6">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Overview
          </Link>
          <Link
            to="/examples/project-preview"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Example
          </Link>
        </nav>
      </div>
    </header>
  )
}
