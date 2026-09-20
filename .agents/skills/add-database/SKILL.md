---
name: add-database
description: Add PostgreSQL persistence with Drizzle, reviewed migrations, local Compose, and real database integration tests to this template. Use when product requirements need relational persistence.
---

# Add database support

Read [architecture](../../../docs/architecture.md) and [operations](../../../docs/operations.md).
Inspect existing manifests, environment schemas, migrations, and CI before changing them.
If persistence already exists, extend it; do not scaffold a second client or reset data.

## Decisions and scope

Use PostgreSQL, `pg`, Drizzle ORM, and Drizzle Kit. Pin compatible mature versions and a
supported PostgreSQL image; check the [official guide](https://orm.drizzle.team/docs/get-started-postgresql)
and [migration documentation](https://orm.drizzle.team/docs/migrations).
Resolve hosting/region or retention requirements if they affect the work. Do not invent
tenants, organizations, soft deletion, auditing, or a generic repository framework.

## Implement

1. Add private `packages/db`, depending on `@workspace/config`. Export explicit source
   subpaths such as `@workspace/db/server` and `@workspace/db/schema`. Keep runtime clients
   in `*.server.ts`; browser-safe domain types belong to features, not the database package.
2. Provide `createDatabase(connectionString)` returning a Drizzle database and its `pg.Pool`.
   Accept configuration explicitly; do not read the web app's environment inside the package.
   App-local `src/server/database.ts` owns a lazy process-local client. Tests close their pools.
   Use a bounded pool and finite connection timeout. Preserve PostgreSQL certificate verification.
3. Put tables in `packages/db/src/schema/`, SQL and metadata in `packages/db/migrations/`,
   and Drizzle configuration in the package. Schema tables do not import application services.
   Add only tables actually required by the feature. If adding infrastructure alone, keep a
   migration exercise in a disposable test copy rather than inventing a permanent product table.
4. Use committed SQL migrations: generate, inspect, then apply. Do not use `push` as the
   production workflow, mutate historical migrations, run migrations on app startup, or perform
   destructive changes without the user's authorization. Document backup and expand/contract steps.
5. Add a root `compose.yaml` containing PostgreSQL only: bind `127.0.0.1`, named volume,
   health check, and a pinned image. Local credentials are explicitly development-only.
   Allow a configurable port and Compose project name so unrelated local databases are untouched.
6. Add `DATABASE_URL` to the server-only environment schema and an empty/commented example.
   Document the local development URL. Use `apps/web/.env.local` consistently for web and CLI
   commands; Node's `--env-file-if-exists` provides loading without another dotenv abstraction.
   Supply production values at runtime. Schema generation/build must not open database connections.
7. Expose root commands `db:up`, `db:down`, `db:generate`, `db:migrate`, `db:studio`, and
   `test:integration`. `db:down` preserves volumes. Migrations/integration tasks are uncached.
   Keep service-free unit tests under `pnpm check`; run database integration tests explicitly in CI
   with a disposable PostgreSQL service. Hash new shared source in application build inputs.
8. Place feature-specific queries in `feature.repository.server.ts`; inject the needed operations
   into the feature service. Define transaction ownership at the use-case boundary.
9. Update operations documentation and README. Add `pg` types and workspace scripts as needed.

## Verify before reporting completion

- Frozen install, formatting, lint, types, unit tests, build, and existing E2E tests pass.
- Run Compose with an isolated project name; migrate an empty database with the committed SQL.
- Rerunning migrations makes no extra changes; generated schema and migrations are consistent.
- Exercise insert/read and a real constraint failure against PostgreSQL; test rollback if the
  feature has a multi-step transaction. Never substitute SQLite for this verification.
- Use a separate test database and reject any production target. Tests clean only their own rows
  or dispose of their own database/container. Close connections; keep ordinary local data intact.
- Directly importing the database from a component must fail lint/build protection.
- Reinspect the existing installation before rerunning this skill. Preserve schema and migrations;
  do not regenerate existing tables merely to make the workflow look newly applied.

If Docker or another prerequisite is unavailable, report which verification is blocked. Do not
describe unexecuted integration tests as passed. This skill does not authorize deploying a database.
