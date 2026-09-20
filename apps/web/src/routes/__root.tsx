import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'
import { site } from '../config/site'
import { highlightThemeCss } from '../features/content/highlight-theme'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${site.name} — Writing`,
        href: '/rss.xml',
      },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: site.name },
      { name: 'description', content: site.description },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{highlightThemeCss}</style>
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-background p-3 focus:not-sr-only focus:absolute"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  )
}
