# Local development and operations

## Base application

Use Node from `.node-version` and pnpm from `package.json#packageManager`.
`pnpm install` then `pnpm dev` starts the application at `http://127.0.0.1:3000`.
No environment file, Docker, or external account is required. The development port is strict so
another application does not silently move this app to a different port.

`pnpm build` creates `apps/web/.output`. `pnpm start` starts its Node server.
Set `HOST` and `PORT` in the process environment as needed. The build is a generic Node/Nitro
deployment. Vercel is an additional deployment target; the repository's README documents its
project settings and Git deployment workflow. Keep Node on its pinned supported LTS line in
production. Serve HTTPS through your platform or reverse proxy.

## Environment

Optional local settings live in `apps/web/.env.local`, based on `.env.example`. Node explicitly loads
that file for development and production-start commands; platform environment values take precedence.
Never commit local files or real credentials. `.env.example` uses public values and commented placeholders.

`VITE_APP_NAME` is public and compiled into the browser bundle. All `VITE_` variables must be considered
public; never prefix secrets that way. Only explicitly selected fields appear in the public environment
object. `APP_ORIGIN`, when set, is an HTTP(S) origin without a trailing slash. It controls the allowed
Origin/Referer for server-function CSRF checks where browser fetch metadata is unavailable.
Configure trusted proxy routing so the request origin agrees with the public URL.

Server environment parsing is lazy at request time, and reports invalid key names without values.
Builds do not need production secrets. Optional capabilities extend the server schema and examples;
shared packages receive their configuration instead of reading application environment themselves.
Turbo passes declared development variables and hashes public build-time configuration. Update
`turbo.json` when adding build inputs. Do not put credentials or `.env` files into CI artifacts/caches.

## Logging and telemetry

Pino writes JSON to stdout even without an OTLP receiver. `LOG_LEVEL` defaults to `info`;
`OTEL_SERVICE_NAME` defaults to `workspace-web`. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to an
HTTP(S) OTLP base URL to enable log, metric, and trace export. The exporters use the standard
`OTEL_EXPORTER_OTLP_HEADERS` variable for authentication; treat it as a secret. Keep these
variables server-only and provide the endpoint at runtime. The app does not start a Collector.

Use the response `X-Request-ID` to find the matching Pino records. When tracing is enabled,
`trace_id` and `span_id` connect logs to the request span. Logs exclude raw errors and request
data by default. The request metrics are `http.server.request.count` and
`http.server.request.duration`, labeled by normalized method and status class. Do not add
paths, user IDs, or other high-cardinality values as metric attributes.

Node processes export metrics every 60 seconds and flush on SIGTERM. Vercel Functions attempt
to flush all three signals within one second at the end of each invocation. An unavailable
receiver cannot fail an application request; telemetry can be lost after the deadline. Keep
stdout ingestion available, and ensure only one of stdout or direct OTLP feeds a given log
backend. Validate endpoint connectivity and credentials after deployment. Exercise a real
Vercel invocation to confirm the host permits OTLP egress and retains the emitted signals.

## Security and deployment responsibilities

Dynamic responses include nosniff, a referrer policy, framing restrictions, and a conservative permissions
policy. The CSP restricts object embedding, base URLs, and framing; it is not a full script-injection
defense. A strict script/style CSP needs tested SSR nonces. Apply HSTS only after confirming HTTPS and
subdomain policy. Apply corresponding headers at the proxy for static assets and proxy-generated errors.

Set request-body size limits and request/idle timeouts at the production proxy or platform. Use a small
limit appropriate to ordinary JSON forms (for example 64 KiB) and separate explicit upload handling
when added. The template does not claim that string-length validation bounds the whole HTTP body.
Do not enable wildcard credentialed CORS. Webhooks need raw-body signature verification and replay
protection instead of blanket browser CSRF checks.

`/api/health` is liveness only and reveals no dependency credentials or versions. Do not turn it into an
unauthenticated operational dashboard. Add readiness only when a deployment needs it.
Unexpected feature failures log a reference and safe classification, not raw messages, stacks, cookies,
authorization headers, or request bodies. Add a reviewed redacting logger when operational needs justify it.

## When database support is added

The database skill adds PostgreSQL Compose and `db:up`, `db:down`, `db:generate`, `db:migrate`,
`db:studio`, and `test:integration` commands. Document the actual selected image/port and local URL.
Bind to loopback, use a named volume, and preserve data on normal shutdown. Never reuse another
application's database for tests. Tests use a dedicated disposable database and close their connections.

Run generated, reviewed SQL migrations explicitly. Apply them to an empty test database in CI and
verify repeat execution is safe. Do not modify old migrations, use schema push in production, or make
each web replica race to migrate at startup. Use backups and expand/contract changes for deployments;
destructive changes need explicit authorization. Keep TLS certificate verification enabled for hosted DBs.

## When authentication is added

Record registration and provisioning policy, session expiry, verification/recovery behavior, canonical
URL, trusted origins, and provider choices in `docs/product.md`. Keep public registration disabled
when not requested, including direct endpoint access. Use a documented operator provisioning command
when needed, never seeded production passwords. Keep provider defaults for password hashing and CSRF.

Validate a strong production secret and HTTPS URL. Verify HttpOnly/Secure/SameSite cookie behavior,
server-side resource authorization, revocation, and expiry. Avoid cross-request session caches. For
multiple replicas, configure durable rate limiting and trusted proxy headers. No organizations, roles,
billing, or email provider is implied by adding basic authentication.

Verify that Better Auth sees the actual client IP through a proxy you control. With Nitro, the
provider may not resolve a client IP without explicitly configured trusted headers. Its fallback
rate limiter can then group unrelated users by endpoint and return unexpected 429 responses.
Only trust forwarded IP headers that your edge replaces; test distinct client IPs through the
deployed proxy and keep production rate limiting enabled.

## Dependency maintenance

Use frozen lockfile installation in CI. Review packages requiring lifecycle scripts in `allowBuilds`;
do not globally enable scripts. The normal release delay is 24 hours. For an urgent security patch,
review the advisory and use a narrowly scoped, documented temporary exception, then remove it.
Do not hide findings with blanket audit exclusions. Dependabot proposes changes; maintainers review them.
