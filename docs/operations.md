# Development, publishing, and operations

## Toolchain and outputs

Use Node 24.21.0 and pnpm 12.4.2. `pnpm dev` starts local development on port 3000, including
drafts. `pnpm build` creates the production `.output/public` directory in `apps/web` plus build-time
server code in `.output/server`. `pnpm start` serves only static output on port 3000; set `PORT`
to change it. Do not deploy `.output/server` to GitHub Pages.

`pnpm test:e2e` builds the real site and isolated content fixtures, then tests their static
outputs. `.output-fixtures` is disposable and never uploaded. Build failures must stop publishing;
do not fall back to a client-only application shell when prerendering fails.

## GitHub Pages setup

Use the existing `antoncarlsson/antoncarlsson.github.io` repository. Select GitHub Actions as the
Pages source under Settings → Pages. Private repositories require an eligible GitHub plan. If
GitHub rejects Pages activation for the plan, upgrade the plan or explicitly decide whether to
make the source repository public; automation must not change visibility on its own.

The CI workflow uses pinned Actions revisions, a frozen package install, quality checks, a
production build, a route-tree drift check, a separate fixture build, and browser tests before
uploading the Pages artifact. The deployment job receives only `pages: write` and
`id-token: write`, uses the `github-pages` environment, and serializes deployments. PRs validate
without uploading or deploying. Manual workflow runs deploy only when run on `main`.

The repository is a root user site: base `/`, canonical origin `https://antoncarlsson.github.io`.
No CNAME or custom domain is needed. If migrating to a project site or custom domain later,
review base paths, links, canonical metadata, feeds, and deployment configuration together.

## Initial deployment status

On 2026-09-20, GitHub rejected Pages activation for this private repository with HTTP 422:
“Your current plan does not support GitHub Pages for this repository.” Repository admin access
is available. Deployment requires an eligible GitHub plan or an explicit decision to make the
repository public. The implementation does not change repository visibility automatically.

## Content release checklist

1. Edit the profile configuration and add Markdown/MDX content as described in README.
2. Preview drafts using `pnpm dev`; set `draft: false` only for content ready to publish.
3. Run `pnpm check` and `pnpm test:e2e`, and review the production preview.
4. Merge/push to main. Inspect the CI and deployment jobs in Actions.
5. Open the live page directly and refresh it; verify links, assets, metadata, and feeds.

An empty site still produces a valid empty RSS feed and sitemap containing its public index pages.
Drafts are excluded from HTML, feeds, sitemap, and browser imports. Repository visibility is a
separate concern: GitHub can expose draft sources if the repository is public.

## Troubleshooting and rollback

- Build fails: inspect metadata errors, duplicate slugs, malformed MDX, and prerender logs. MDX
  components must be safe to render outside the browser.
- Deployment fails: verify Pages source is GitHub Actions, plan eligibility, Actions permissions,
  and `github-pages` environment rules. Authorize environment approval when configured.
- Nested page 404: confirm the slug is published and its `path/index.html` exists in the uploaded
  artifact. Unknown paths intentionally return the custom 404 with HTTP status 404.
- Missing styles/images: verify absolute root paths and case-sensitive asset filenames.
- New content missing locally: the content watcher restarts Vite when content files change;
  restart `pnpm dev` manually if an editor’s save behavior bypasses the watcher.
- Rollback: revert the offending commit on main; the normal checks and deployment republish
  the prior content. Do not reset repository history.

## Logging and security boundaries

The existing Pino/OpenTelemetry infrastructure is retained for local Start requests and build-time
prerendering with service name `anton-portfolio`. Optional server-only environment variables remain
in `.env.example`. OTLP failure must remain nonfatal. No credentials are required to build the site.

GitHub Pages has no application process, runtime server functions, request logger, or OTLP export.
The template’s dynamic response headers apply only to local/build-time server responses, not
GitHub Pages. Do not claim production request telemetry or custom server headers on this host.
GitHub handles HTTPS; use GitHub’s Pages settings to inspect certificate/HTTPS availability.

Until Pages is enabled, CI still runs all checks and skips artifact upload/deployment with a
notice. After upgrading the account, select GitHub Actions under Settings → Pages, push/merge
this implementation to main if it is not there yet, and run the CI workflow on main. No
additional repository variable or deployment secret is required.
