import { site } from '../config/site'
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {site.name}
        <span className="footer-note">Built with care. Always a work in progress.</span>
      </p>
      <div>
        <a href="/rss.xml">RSS ↗</a>
        {site.links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label} ↗
          </a>
        ))}
      </div>
    </footer>
  )
}
