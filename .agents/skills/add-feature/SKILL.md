---
name: add-feature
description: Implement a product feature through validated domain logic, optional persistence, a thin server boundary, route/UI, and focused tests.
---

# Add a feature

Read [architecture](../../../docs/architecture.md) and [conventions](../../../docs/conventions.md).
Inspect neighboring features and routes first; follow their conventions without copying irrelevant
layers. Establish acceptance behavior, access policy, data ownership, failure cases, and the URL.

1. Define domain values and Zod schemas for untrusted input. Validate search params, server
   function input, HTTP input, and external responses at the boundary where each enters.
2. Add persistence only if required. Use [add-database](../add-database/SKILL.md) if absent;
   then create reviewed schema/migrations and a feature-local `*.repository.server.ts`.
   Give the service narrow operations instead of a database client.
3. Implement a plain TypeScript service with the business rules and explicit expected outcomes.
   Inject time, IDs, or integrations when they change behavior worth testing. Define transaction
   ownership for multi-step writes. Keep the service independent of TanStack and React.
4. Add a thin `*.functions.ts` for internal UI calls. Validate input there, establish the actor
   for protected work, and delegate to the service. Use a server route for a real external HTTP
   consumer or webhook, with its own validation/signature checks.
   Use the server-only Pino logger for unexpected operational events. Log a stable event and
   safe fields, never raw errors or payloads. Add low-cardinality metrics or spans only where
   request telemetry cannot explain the feature's behavior.
5. Add the TanStack route and feature UI. Use semantic, accessible controls; validate forms on
   the client for feedback and again on the server. Handle pending, empty, expected-error, and
   unexpected-error states. Recheck mobile layout and keyboard use.
6. Test service decisions and trust boundaries with Vitest, real persistence with integration
   tests when relevant, and the critical user journey or direct denial case with Playwright.
   Verify new log fields and telemetry attributes cannot expose secrets or user identifiers.
7. Run `pnpm format`, `pnpm check`, `pnpm build`, and relevant `pnpm test:e2e` checks. Keep
   `routeTree.gen.ts` synchronized. Update docs/env examples for new operational needs.

Do not add a repository, Query, generic abstraction, or auth layer to a static feature merely
to make it resemble a larger feature. Report tests actually run and product decisions remaining.
