---
name: add-authentication
description: Add Better Auth login, logout, sessions, current-user access, protected pages, and protected server functions behind an application boundary. Registration and providers follow product requirements.
---

# Add authentication

Read [architecture](../../../docs/architecture.md) and [operations](../../../docs/operations.md).
Inspect existing auth, schema, and product decisions. Follow [add-database](../add-database/SKILL.md)
first if the application needs persistence and does not have it. Do not replace existing auth
or silently add a second provider.

## Resolve the product policy

Establish whether access is public, internal, invited, or provisioned; whether users may register;
and whether email/password is appropriate. Ask only unresolved questions that change this work.
Do not assume organizations, tenancy, roles, OAuth, billing, or public registration.
For email/password, decide verification and recovery needs; public launch needs a deliberate
email/recovery policy. Do not configure pretend email delivery.

## Implement the boundary

1. Add private `packages/auth` with explicit `./server`, `./client`, and `./types` exports.
   Use a factory accepting database, secret, canonical URL, and registration policy. Keep provider
   imports in this package and small app-local integration files. Domain services receive an
   application-owned actor (`userId`, plus needed public fields), never provider session types.
2. Follow current [TanStack integration](https://better-auth.com/docs/integrations/tanstack),
   [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), and
   [email/password documentation](https://better-auth.com/docs/authentication/email-password).
   The adapter is currently `@better-auth/drizzle-adapter`; verify installed exports rather than
   copying outdated snippets. Keep Better Auth and its adapter on a compatible pinned version.
3. Generate auth tables from the actual provider configuration using its current CLI/API. Store
   the resulting Drizzle schema in `packages/db/src/schema/auth.ts`, and commit Drizzle-generated
   SQL migrations there. Dependency direction is `auth → db`; the database must not import auth.
   Generation may require a dedicated configuration that avoids a schema-generation import cycle.
4. Mount Better Auth's handler in `apps/web/src/routes/api.auth.$.ts`. This vendor HTTP protocol
   is an intentional exception to application server functions. Use the provider client behind
   a narrow wrapper for login/logout; do not proxy every auth endpoint through server functions.
   Add the TanStack cookie plugin, last, only if invoking cookie-setting APIs inside server functions.
5. Add lazy app-local server configuration and validated `BETTER_AUTH_SECRET`, `APP_ORIGIN`,
   and `DATABASE_URL`. Fail with key names, never values. Require a strong unique production secret
   and exact trusted origins. Builds and migrations must not require real production secrets.
6. Expose current-user and protected-operation server functions using real request headers.
   Use app-local function middleware or a shared server-only helper to require a session.
   Route `beforeLoad` redirects improve UX; every protected server operation must enforce auth
   independently. Application services enforce resource ownership separately from authentication.
7. Add accessible login, logout, and protected-shell UI. Return only selected actor fields to the
   browser. Validate redirect destinations as local paths (reject protocol-relative/external URLs).
   Invalidate router/user caches after login/logout. Never cache sessions across SSR requests.
8. If registration is disabled, disable the server endpoint as well as omitting the UI. Provide
   an explicit local/operator provisioning command using the provider's password implementation.
   Read credentials from a prompt or environment, not command-line arguments or committed files.
   A provisioning-only factory may enable signup within that process; it must not enable the
   public application's signup endpoint. Do not add an admin/RBAC plugin merely for provisioning.
9. Preserve CSRF/origin checks. Use HttpOnly session cookies, Secure in production, appropriate
   SameSite behavior, and explicit expiry. Check trusted proxy handling: Nitro may not expose a
   usable client IP to Better Auth unless trusted forwarded headers are configured. At the edge,
   replace client-supplied forwarding headers, then test distinct users behind the proxy; otherwise
   unrelated requests may share one fallback rate-limit bucket and receive 429 responses. In
   production with multiple instances, use durable rate-limit storage rather than a per-process map.
10. Update environment examples, operations docs, build hash inputs, and database-backed CI tests.
    Do not add public APIs, email providers, roles, or organization schema incidentally.

## Verify

Use an isolated PostgreSQL database and non-production credentials:

- Apply fresh migrations and repeat safely. Verify schema-generation output before replacing any
  maintained schema. Existing installations are extended, never reset or overwritten blindly.
- Provision a test user; login succeeds, invalid credentials fail, current user returns selected fields.
- Logout revokes the session, and an expired or absent session cannot access a protected operation.
- Protected-page redirects work on direct loads and client navigation.
- A direct call to a protected server function without a cookie fails even when bypassing the page.
- Disabled registration is denied by a direct HTTP signup request. When registration is required,
  test the enabled flow and the chosen verification policy.
- Test origin rejection and cookie attributes appropriate to HTTP-local versus HTTPS-production use.
- Run formatting, lint, types, unit/integration tests, production build, and E2E tests.

Report product decisions, changed boundaries, actual tests, and remaining deployment requirements.
Do not claim provider replacement is free: sessions, credentials, and schema still require migration.
