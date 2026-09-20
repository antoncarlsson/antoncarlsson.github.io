# Anton Carlsson’s personal website

Purpose: showcase personal projects and share ideas with readers, peers, and people interested
in Anton’s work. The primary journey is Home → Projects or Writing → a detail page.

The visual direction is a developer notebook: monospace headings and metadata, readable body
text, muted green accents, restrained borders, responsive layouts, and system light/dark styling.
Home balances selected projects and recent posts; About introduces the author. No professional
claims or external accounts are invented. Initial collections are empty, with local-only draft
examples for Markdown, MDX, and project content.

Content lives in the repository, edited as Markdown or trusted MDX. Publication is explicit via
`draft: false`. Blog dates order posts; dates do not schedule releases. Public routes use trailing
slashes in canonical links and directory index files. Content slugs come from filenames.

Hosting: https://antoncarlsson.github.io/, base `/`, GitHub Pages via GitHub Actions on successful
main builds. Only static output is published. A separate test artifact exercises published content
without adding sample posts to the real site. No database, authentication, CMS, comments,
analytics, contact form, search, or custom domain is included.

The template’s server-only logger and telemetry remain useful locally and during prerendering.
They do not run on GitHub Pages, and server headers cannot be claimed for Pages responses.
