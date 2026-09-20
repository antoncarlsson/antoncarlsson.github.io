# AWesome Template

A small, opinionated foundation for TypeScript web applications built by people and coding
agents. The base runs without accounts, Docker, a database, or authentication. It includes a
working feature that shows the intended path from form to validated server function to
independent domain service.

## Use this template

On [GitHub](https://github.com/AgileWork-sweden/awesome-template), click **Use this template**
and select **Create a new repository**. Choose an owner, name, and visibility, then click
**Create repository from template**. Your new repository starts with these files and its own
commit history. See [GitHub's guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) for details.

## Quick start

Install [Node.js](https://nodejs.org/) **24.21.0** (see `.node-version`) and
[pnpm](https://pnpm.io/installation) **12.4.2** (see `package.json#packageManager`). Then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:3000>. The example form is at
<http://127.0.0.1:3000/examples/project-preview>. No environment file is needed.
If a local setting is needed, copy `apps/web/.env.example` to `apps/web/.env.local` and edit it.
The local file is ignored by Git. Never put a secret in a `VITE_` variable.

## Logging and telemetry

The server writes structured Pino JSON logs to stdout at `info` level. Completed requests include
a generated `request_id`, method, status, and duration; the response has the same
`X-Request-ID` header. Logs made inside a request also include active trace and span IDs when
tracing is enabled. Unexpected failures receive a safe reference ID; raw errors, request bodies,
query strings, cookies, and credentials are not logged.

Set `LOG_LEVEL` to change verbosity and `OTEL_SERVICE_NAME` to name the service. To export
logs, metrics, and traces, set `OTEL_EXPORTER_OTLP_ENDPOINT` to an OTLP/HTTP receiver base URL
(for example `http://localhost:4318`). The app sends protobuf to `/v1/logs`,
`/v1/metrics`, and `/v1/traces`. Standard `OTEL_EXPORTER_OTLP_HEADERS` supplies credentials
when needed. These are server-only runtime values. An OpenTelemetry Collector is optional and
is not needed for local development. If your log platform also ingests stdout, disable one
ingestion path to avoid duplicate stored logs.

On a long-running Node server, metrics export periodically and telemetry flushes on shutdown.
On Vercel Functions, telemetry gets a bounded flush after each invocation. Export failures do
not fail requests, but a slow or unavailable receiver can cause dropped telemetry. See
[operations](docs/operations.md) for deployment and investigation guidance.

## Commands

| Command                             | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                          | Start the web app in development                       |
| `pnpm format` / `pnpm format:check` | Apply/check Oxfmt formatting                           |
| `pnpm lint` / `pnpm lint:fix`       | Type-aware Oxlint and architecture checks              |
| `pnpm typecheck`                    | Strict TypeScript checks                               |
| `pnpm test`                         | Vitest unit and boundary tests                         |
| `pnpm check`                        | Format, lint, types, and Vitest                        |
| `pnpm build` / `pnpm start`         | Build/start the production Node server                 |
| `pnpm test:e2e`                     | Build and run Playwright against the production server |

For browser tests, first run `pnpm --filter @workspace/web exec playwright install chromium`.
On Linux, Playwright may also require system dependencies; CI installs them automatically.
`pnpm start` uses port 3000 by default; set `HOST` and `PORT` for a deployment.

## Deploy to Vercel

The web app uses Nitro to build for Vercel Functions. To deploy from Git:

1. Push the repository to GitHub, GitLab, or Bitbucket and import it as a new Vercel project.
2. Set the project **Root Directory** to `apps/web`. Keep **Include source files outside of
   the Root Directory in the Build Step** enabled so Vercel can install the pnpm workspace and
   compile `packages/ui`. The included `apps/web/vercel.json` selects the **TanStack Start**
   framework preset. Use its detected build and output settings.
3. Select **Node.js 24.x** in Build and Deployment settings. Add
   `ENABLE_EXPERIMENTAL_COREPACK=1` in Environment Variables so Vercel uses the repository's
   pinned pnpm 12 version instead of its default pnpm version. Enable **Automatically expose
   System Environment Variables** so Nitro detects Vercel during the build. If that setting
   must remain disabled, set `NITRO_PRESET=vercel` for Production and Preview instead.
4. Add any app settings in Vercel Environment Variables for the environments that need them.
   `VITE_APP_NAME` is optional and public: Vite includes `VITE_` values in browser code.
   Keep secrets in unprefixed server variables. Set `APP_ORIGIN` only when it exactly matches
   that environment's public HTTPS origin, without a trailing slash. Leave it unset for
   preview deployments with changing URLs so server functions use the request origin.
5. Deploy and check `/api/health` and the example form at `/examples/project-preview` on
   the generated URL. Subsequent pushes to the production branch deploy to production; pull
   requests get preview deployments.

For a manual deployment, link the monorepo from its repository root with `npx vercel link --repo`,
then run `npx vercel` for a preview or `npx vercel --prod` for production. Use the same Vercel
project settings above. See [Vercel's TanStack Start guide](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel)
and [monorepo guidance](https://vercel.com/docs/monorepos/monorepo-faq).

## Where code goes

```text
apps/web/                 Deployable TanStack Start application
  src/routes/             URL routes, page composition, HTTP endpoints
  src/features/           Product features: schema, service, server function, UI, tests
  src/server/             Application server infrastructure
  tests/e2e/              Production browser and HTTP tests
packages/ui/              Shared shadcn-style presentation primitives
packages/config/          Shared TypeScript configuration
.agents/skills/           Agent workflows and optional capability instructions
docs/                     Architecture, conventions, and operations
```

React, TanStack Router/Start/Form, Tailwind CSS, shadcn-style primitives, Zod, Vitest,
Playwright, pnpm workspaces, Turborepo, Oxlint, and Oxfmt are already configured.
Use server functions for internal app calls and server routes for external HTTP endpoints.
The server boundary validates input and delegates business rules to plain TypeScript services.
Add TanStack Query when a feature actually needs shared server-state caching.

Read [architecture](docs/architecture.md) for dependency direction,
[conventions](docs/conventions.md) for code placement, and [operations](docs/operations.md)
for environment and deployment notes. `AGENTS.md` gives coding agents the frequent rules.

## Bootstrap with an agent

Give your agent the product requirements and point it at
[bootstrap-application](.agents/skills/bootstrap-application/SKILL.md). For example:

> Read `.agents/skills/bootstrap-application/SKILL.md` and turn this template into an
> internal project tracker. Users are provisioned by an operator; public registration is
> disabled. Projects and tasks need durable storage, and each user may edit only their own
> projects. Implement one complete journey and verify it.

The bootstrap skill selects a landing-page, web-app, or SaaS profile. It composes the
[database](.agents/skills/add-database/SKILL.md) and
[authentication](.agents/skills/add-authentication/SKILL.md) capabilities only when needed.
Use [add-feature](.agents/skills/add-feature/SKILL.md) for subsequent product work,
[review-code](.agents/skills/review-code/SKILL.md) before merging, and
[verify-application](.agents/skills/verify-application/SKILL.md) for release checks.
See [agent workflows](docs/agent-workflows.md) for how the skills fit together.

## Maintenance and release

GitHub Actions will run quality and production browser checks on pushes and pull requests.
A separate weekly audit checks the locked dependency tree. Application dependency changes
are reviewed manually because GitHub currently documents Dependabot pnpm support only through
v10; Dependabot still proposes GitHub Actions updates. See
[maintaining the template](docs/maintaining-template.md) for updates and release checks.

Before publishing a project created from this template, review license attribution, replace
the sample copy, and decide whether to keep the example feature.
