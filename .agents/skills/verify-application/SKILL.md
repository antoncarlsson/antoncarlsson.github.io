---
name: verify-application
description: Verify a template-derived application through static checks, build, relevant integration and browser behavior, and a candid evidence report.
---

# Verify an application

Read [operations](../../../docs/operations.md) and the application's product/deployment docs.
Inspect changed code to select the relevant checks; verification is evidence, not a ritual.

1. Confirm the pinned Node/pnpm versions and frozen install for a fresh checkout or lockfile
   change. Run `pnpm check` and `pnpm build`.
2. Run `pnpm test:e2e` for routes, forms, auth, or HTTP-boundary changes. Check production SSR
   and a real browser journey, including accessible navigation and mobile layout when affected.
3. If persistence exists, apply migrations to an isolated empty PostgreSQL database, repeat
   migrations, run real integration tests, and inspect generated SQL. Never point tests at
   production or reset an existing local database. If auth exists, check login/logout,
   disabled/enabled registration policy, session expiry, direct protected calls, and ownership.
4. For new server-only modules or changed build tooling, perform a safe negative import test in
   a disposable copy and confirm the build rejects a client import. Recheck env validation,
   headers, and origin behavior when those boundaries change.
   For server behavior changes, check request IDs, Pino safe fields, and relevant metrics/spans.
   Send logs, metrics, and traces to a test OTLP receiver; verify stdout and request success
   when the receiver is unavailable. Require a real deployed invocation before claiming
   Vercel telemetry is verified.
5. Report commands, results, environment, skipped checks, and material deployment requirements.
   Do not call a result verified from a static read or a skipped test. Keep temporary data and
   services isolated, and clean up resources created for this verification.
