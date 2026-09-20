# Anton Carlsson · Personal notebook

A personal portfolio and blog at **https://antoncarlsson.github.io/**. Built with React,
TanStack Start/Router, TanStack Markdown, TanStack Highlight, MDX, Tailwind, and the shared UI
package. GitHub Pages serves prerendered HTML; no application server is deployed.

## Develop and preview

Use Node **24.21.0** (`.node-version`) and pnpm **12.4.2** (`packageManager`), then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Visit http://127.0.0.1:3000. Drafts appear locally with a draft label. To preview the exact
published site, run `pnpm build` followed by `pnpm start`. This preview serves static files,
including real 404 responses, and excludes drafts.

## Make it yours

Edit `apps/web/src/config/site.ts` for your name, introduction, biography, site URL, and optional
links. Edit the About route for additional sections. No résumé, employer, contact address,
or external profile is assumed. The initial public collections are intentionally empty.

## Write a post or project

Add a lowercase, hyphenated `.md` or `.mdx` file to `apps/web/content/blog/` or
`apps/web/content/projects/`. Its filename becomes the URL slug. Do not use the same slug for
both formats in one collection. Every file starts with YAML frontmatter:

```yaml
---
title: A small discovery
description: A short summary for lists, social previews, and RSS.
date: '2026-09-20'
draft: true
---
```

Posts require a valid `YYYY-MM-DD` date. Projects do not need a date and may add:

```yaml
technologies: [TypeScript, React]
featured: true
source: https://github.com/your-account/your-project
demo: https://your-project.example.com
```

`title` and `description` are required; `draft` defaults to `true`. Change it to `false`,
preview, and merge to `main` to publish. Dates control ordering, not scheduled publication.
The manifest drives page imports, prerender paths, lists, the sitemap, and RSS. Invalid metadata
or duplicate slugs fail the build. Drafts are excluded before imports are generated, including
from JavaScript bundles. Files committed to a public repository remain readable on GitHub even
when they are drafts.

Markdown uses TanStack Markdown. MDX uses `@mdx-js/rollup` so you can mix Markdown with React.
Both use TanStack Highlight for fenced code. Register additional languages in
`src/features/content/highlight.ts`. Unknown languages remain readable plain text. The Markdown
parser deliberately supports a narrower syntax profile than full CommonMark/GFM; use MDX when
its compiler ecosystem is needed.

MDX includes `<Callout>Helpful context.</Callout>` and `<Counter />` examples. Add reusable
components to the MDX component map or import your own. Only trusted repository authors should
write MDX: it compiles to executable JavaScript. Components must render without browser globals
at build time; browser-only behavior belongs in effects or event handlers.

Use `/images/filename.webp` URLs for images stored in `apps/web/public/images/`, supply useful
alt text, and resize images before committing them. Internal links use published URL paths,
for example `/blog/a-small-discovery/`, rather than `.md` filenames. Heading anchors are automatic.

## Verify

Husky installs a pre-push hook during `pnpm install`. Every push runs formatting, lint, type,
unit and integration checks, then builds the site and runs the browser tests; a failing command
stops the push. Install Chromium with the command below before your first push. Run
`pnpm run prepare` to reinstall the hook in an existing checkout.

```sh
pnpm format
pnpm check
pnpm build
pnpm --filter @workspace/web exec playwright install chromium
pnpm test:e2e
```

Local E2E runs choose two free ports so an open preview cannot block a push. CI uses ports 4173
and 4174. Fixture builds go into `.output-fixtures` and are never uploaded to Pages. Tests cover
navigation, no-JavaScript HTML, deep links, MDX hydration, highlighting, drafts, metadata, feeds,
mobile layout, and 404s. Production tests do not depend on individual posts or projects; the
fixture tests cover content behavior. The build audits the static artifact for draft markers and
source files.

## Publish to GitHub Pages

The verified remote is `antoncarlsson/antoncarlsson.github.io`; it is a user site with base `/`.
In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. A private
repository requires a GitHub plan that supports private-repository Pages. Do not change repository
visibility just to bypass a plan restriction. The published website itself is intended to be public.

The CI workflow checks, builds, tests, and uploads `apps/web/.output/public`; a dependent job
publishes that same artifact after successful pushes to `main`. Pull requests never publish.
Use **Actions → CI → Run workflow → main** for a manual redeploy. If environment approval is
configured for `github-pages`, approve the deployment in GitHub.

After the first release, visit https://antoncarlsson.github.io/ and verify Projects, Writing,
About, `/rss.xml`, `/sitemap.xml`, and an unknown URL. There is no custom domain to configure.
See [operations](docs/operations.md) for troubleshooting and rollback, and
[product decisions](docs/product.md) for the intended scope.

The codebase began with AWesome Template. Its reusable packages and optional capability skills
remain available; see [architecture](docs/architecture.md) and [conventions](docs/conventions.md).

Until Pages is enabled, CI still runs all checks and skips artifact upload/deployment with a
notice. After upgrading the account, select GitHub Actions under Settings → Pages, push/merge
this implementation to main if it is not there yet, and run the CI workflow on main. No
additional repository variable or deployment secret is required.
