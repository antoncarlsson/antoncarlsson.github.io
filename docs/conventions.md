# Conventions

For this static website, route loaders may directly read the browser-safe generated content
manifest. Filesystem scanning and compilation stay in build-only modules. No server boundary
is needed for public static content. Keep draft filtering before generated imports.

## Names and placement

Place a feature's schema, service, server function, tests, and components together under
`apps/web/src/features/<feature>/`. Use names such as `project.schema.ts`,
`project.service.ts`, `project.functions.ts`, and `components/project-form.tsx`.
Add a `project.repository.server.ts` only when persistence exists. Routes in `src/routes/`
stay small: validate search parameters, load data, set metadata, and render feature UI.

Keep a file close to its only consumer. Extract a shared package for a stable, real reuse
boundary. Never create an app-wide `utils/`, `services/`, or `components/` dumping ground.
UI primitives shared across features belong in `@workspace/ui`; product components stay
with their feature.

## Trust and behavior

Treat server-function inputs, HTTP bodies, search parameters, environment, webhooks, and
external responses as runtime data. Parse with Zod at the appropriate trust boundary.
Use the same schema in a form when it improves feedback, but validate again on the server.
Services accept validated values, return explicit expected outcomes, and throw for unexpected
failures. Keep transport errors safe for users; log only selected nonsecret context.

Services express business rules as ordinary TypeScript. Inject narrow persistence/integration
operations when needed. Server functions and HTTP routes adapt requests to services and map
results to responses. Domain services do not read cookies, request headers, or process env.
Protected operations check the current actor and resource ownership on the server.

Use the server-only Pino logger for operational events. Log stable event names and selected
nonsecret fields. Do not log raw errors, request/response objects, payloads, query strings,
credentials, session data, or personal identifiers. The logger redacts common secret field
names as a safeguard, not as permission to pass untrusted objects. Unexpected failures use
the safe reference ID helper. Add a metric or span for a meaningful operation when HTTP request
signals cannot explain its behavior; keep metric attributes low-cardinality.

Use TanStack Router loaders for route-owned data. Add TanStack Query when a feature needs
shared cache, background refresh, or optimistic updates. Avoid duplicate loader/query caches.
Use TanStack Form for interactive forms and shadcn primitives for accessible controls.
Keep URL paths and redirects local and explicit; validate external redirect destinations.

## Tests and maintenance

Write Vitest tests beside services/schemas; test meaningful success and failure behavior.
Integration tests verify boundaries and real persistence when present. Playwright tests cover
critical browser journeys and direct HTTP/server-function denial cases. Do not encode the
implementation's internal steps as tests.

Follow current pinned dependencies and the lockfile. Run `pnpm format`, `pnpm check`,
`pnpm build`, and relevant E2E tests before review. Update docs when a new capability adds
commands, environment keys, deployment requirements, or architectural exceptions.
