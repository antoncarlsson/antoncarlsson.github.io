# Working in this repository

Read `docs/architecture.md` and `docs/conventions.md` before changing application boundaries.
Use the matching workflow in `.agents/skills/` for bootstrapping, database/auth capabilities,
adding a feature, reviewing, or verification. Resolve product decisions with the developer;
make routine stack and implementation choices from the established conventions.

## Boundaries

- `apps/` holds deployable applications; `packages/` holds reusable code. Keep the base thin.
- Organize product code in `apps/web/src/features/<feature>/`. Routes own URLs and page composition.
- UI calls server functions for internal work. External HTTP consumers use server routes.
- Validate untrusted input with Zod at the boundary. Server functions/routes delegate to ordinary
  services; services receive dependencies and do not import TanStack, React, Drizzle, or providers.
- Keep secrets and clients in server-only modules. Never put credentials in `VITE_` variables or
  expose private package exports through a mixed barrel.
- Check authorization in every protected server operation. A route redirect is only a UI aid.
- Use the server-only Pino logger for operational events. Keep log fields and metric attributes
  bounded and nonsecret; correlate failures with request IDs and traces. Never log raw errors,
  request bodies, credentials, or user identifiers. OTLP export must not fail requests.
- Use PostgreSQL/Drizzle and Better Auth only when the product needs them, through their skills.
  Do not infer organizations, roles, billing, OAuth, or public registration.

## Work and verification

- Inspect nearby code and follow its naming, error handling, and tests. Prefer small explicit
  changes over generic abstractions. Keep generated `routeTree.gen.ts` in sync after route edits.
- Run `pnpm check` and `pnpm build` for relevant code changes. Run `pnpm test:e2e` for changed
  browser behavior or HTTP boundaries. Add focused tests for behavior and trust boundaries.
- Review generated migrations before applying them; never reset existing data to make tests pass.
- Report what changed, checks actually run, and any material deployment or product decision left.
- When changing server behavior, verify useful logs, request metrics/traces, safe fields, and
  OTLP failure handling. Test a real deployed invocation before claiming host telemetry works.
- Do not publish, deploy, create remote resources, or assume a GitHub owner from this template.

Root commands, local environment, and release procedures are in `README.md` and `docs/operations.md`.
