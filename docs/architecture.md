# Architecture

## Personal website deployment profile

This application is a static portfolio and blog. TanStack Start/Nitro run locally and during
build-time prerendering; GitHub Pages receives only `.output/public`. There are no deployed
server functions, health endpoint, or application runtime. The server patterns below are retained
for optional future capabilities, not requirements for static content.

`features/content` owns metadata validation, a build-time manifest, rendering, and shared MDX
components. Markdown uses TanStack Markdown; MDX uses the MDX compiler. Both use TanStack
Highlight. The Vite plugin filters drafts before generating lazy content imports. Explicit
prerender paths and discovery assets derive from the same manifest. The build-time file reader
is prohibited from client imports. Routes load public, serializable metadata and render content
from the browser-safe manifest without a server function.

Production previews and E2E tests serve static files with genuine 404s. Isolated test fixtures
build into `.output-fixtures`, separate from the deployed artifact. Pino and OTLP remain
server-only development/build facilities; Pages has no application request telemetry.

The template has one deployable application (`apps/web`) and two private, reusable packages:
`@workspace/ui` and `@workspace/config`. Thin template, strong conventions.

## Dependencies

```text
Route / feature UI → server function or HTTP route → service → persistence / integration
        ↓                     ↓
  UI primitives         public input schemas
```

- Routes own URL/search validation, loaders, metadata, and page composition.
- Features own schemas, business behavior, their server-function boundary, and feature UI.
- Services are ordinary TypeScript functions. They do not import React, TanStack, request/cookie
  APIs, Drizzle, or provider SDKs. Pass small dependency objects where real integrations exist.
- Feature repositories/integrations implement those dependencies. Use cases own transactions.
- `packages/ui` contains presentation primitives, never features, environment access, or data clients.
- `packages/config` contains reusable TypeScript configuration. Root lint/format settings stay at root.
- Cross-feature calls use explicit public services/types. Never reach into another feature's
  components or repository. Extract a shared rule or orchestration service if a cycle develops.

No mandatory repository interface, DI container, generic service class, or universal response
envelope. A static page need not have a service. Extract packages when reuse or a real boundary
justifies them, not because code has reached a particular line count.

## Execution boundaries

TanStack route loaders can run on both server and browser. Private work goes through
`createServerFn`, with Zod input validation and thin delegation to a service. Server routes are
for health checks, webhooks, and external HTTP consumers. Use POST for mutations. HTTP liveness
is infrastructure and does not need an artificial domain service.

The framework transforms `*.functions.ts`; those modules are intentionally imported by UI.
Secrets, database clients, and provider integrations live in `*.server.ts`, `src/server/`, or
explicit server exports. Do not create barrel exports that mix public and private modules.
Ordinary React components are SSR-compatible; `.client.ts` is reserved for truly browser-only code.

`vite.config.ts` enforces import protection in development and builds across first-party sources.
Custom deny patterns retain `**/*.server.*` explicitly because user file patterns replace the
framework defaults. `scripts/check-repository.mjs` provides additional narrow architectural checks;
it is not a complete security analyzer. Treat negative build tests as upgrade acceptance checks.

`src/start.ts` explicitly registers CSRF protection for server functions. A server-only function
resolves the configured public origin. `src/server.ts` applies headers to completed dynamic
responses, including 404s. Static assets are served by Nitro; the deployment proxy should also
apply appropriate headers to static/error responses it serves itself.

## Observability

`src/server/observability.server.ts` owns the server-only Pino logger and OpenTelemetry SDK.
The server entry point creates a request span and records a request count and duration.
Application code logs through Pino; a bridge copies selected safe fields into OpenTelemetry
log records. Pino JSON always goes to stdout. When an OTLP endpoint is configured, logs,
metrics, and traces export over OTLP/HTTP protobuf.

Request IDs are generated locally and returned in `X-Request-ID`. Active trace/span IDs appear
in Pino logs. Metric attributes use only a normalized HTTP method and status class, avoiding
unbounded paths or user data. A Node process batches telemetry and periodically exports metrics;
Vercel invocations attempt a bounded flush before returning. Export failure is nonfatal.
Neither services nor shared UI packages import the logger or telemetry SDK.

## State and forms

The example uses TanStack Form with Zod. Client validation improves usability; the server validates
again. Form validators do not apply transformed values to submission data, so submission parses
explicitly. Expected domain failures are small discriminated results; unexpected errors are safe
to show and logged only with safe metadata/reference IDs.

Use Router loaders for ordinary route-owned data. Introduce TanStack Query when a feature needs
shared server-state caching, background refresh, or optimistic updates. Loaders then use that same
cache. Each SSR request owns its Query client; never share user data across requests. No Query
dependency or provider is installed without a real use.

## Optional capabilities

`add-database` introduces `packages/db`, PostgreSQL, Drizzle, migrations, and local Compose.
`add-authentication` introduces `packages/auth`, Better Auth, and app-local framework integration.
Dependency direction is `auth → db`, never `db → auth`. Auth schema and SQL live in `packages/db`.
Domain code receives a small application actor rather than Better Auth's session types.

Better Auth's own HTTP handler/client protocol is a deliberate exception to application server
functions. Registration, account provisioning, verification/recovery, tenancy, roles, identity
providers, and billing are product decisions. A page guard never replaces server authorization.

Only add an independent Fastify application when substantial external consumers need an independent
API lifecycle. That may justify a contracts package, versioned HTTP contracts, and separate service
ownership. Internal frontend/backend type sharing alone does not justify `packages/contracts`.

## Build and package strategy

UI exports TypeScript source for Vite to compile. Use explicit package exports and `workspace:*`
dependencies. UI uses relative imports or package subpaths, not application aliases. Tailwind scans
the UI source explicitly. There is no publishing or UI build pipeline.

Turbo caches only production builds initially. UI sources, shared configuration, public build-time
environment, and local environment files are included in the relevant hashes. Test/typecheck tasks
remain uncached. New shared packages must be included in build inputs. `routeTree.gen.ts` is committed,
generated by Start/Vite, ignored by format/lint, and checked for drift after a build.

## Compatibility

Use the pinned runtime/toolchain and lockfile. Start's current documentation describes release-candidate
maturity; the Nitro Vite adapter is a pinned beta. Their upgrades require the full production test suite.
TypeScript 6 is deliberately retained from the official Start example's compatibility line.
Oxfmt is the sole formatter, although it internally bundles support for some formats through Prettier.

Sources: [Start execution](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model),
[import protection](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection),
[middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware),
[hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting),
[shadcn monorepos](https://ui.shadcn.com/docs/monorepo).
