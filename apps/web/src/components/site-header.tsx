import { Link } from '@tanstack/react-router'
import { site } from '../config/site'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" aria-label={`${site.name} — home`}>
          <span className="monogram" aria-hidden="true">
            ac<span>.</span>
          </span>
          <span>
            {site.name.toLowerCase()}
            <span className="wordmark-sub">a personal notebook</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/projects">Projects</Link>
          <Link to="/blog">Writing</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </header>
  )
}
