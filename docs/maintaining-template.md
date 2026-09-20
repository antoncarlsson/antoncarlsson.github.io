# Maintaining and releasing the template

## Updating dependencies

Keep Node, pnpm, Start, Router, Vite, Nitro, React, and TypeScript on an explicitly tested
set. Review upstream compatibility notes before changing a framework version. Make package
updates in small groups, commit the regenerated lockfile, and run a frozen install in a fresh
checkout. The workspace applies a 24-hour minimum release age; an urgent security fix needs a
narrow documented exception and a later cleanup. Review every new dependency lifecycle script
before adding it to `allowBuilds`.

Keep Pino and the OpenTelemetry API, SDK, and OTLP exporters on a tested compatible set.
Review their release notes together, including the JavaScript logs SDK's development status.
After upgrades, send all three signals to a test OTLP receiver, test export failure and
Vercel-style bounded flushing, and inspect the browser bundle for telemetry code or secrets.
The protobuf exporter brings a `protobufjs` postinstall script; review that script before
changing its `allowBuilds` entry.

GitHub currently documents pnpm lockfile support for Dependabot through v10. This template
uses pnpm 12, so Dependabot is configured only for GitHub Actions. Review JavaScript package
releases and security advisories manually, then update with pnpm. The scheduled `pnpm audit`
workflow raises high/critical advisory failures; investigate the actual dependency path and
available fix, and do not blanket-ignore advisories. Revisit automation when GitHub documents
support for the pinned pnpm lockfile.

For Start, Nitro, import-protection, or Vite upgrades, run negative client-import builds in a
disposable copy in addition to the normal suite. Confirm that a `*.server.ts` module and a
private workspace server export cannot enter the browser bundle. Verify production SSR, 404
headers, form RPC validation, origin checks, and browser hydration. Keep generated
`apps/web/src/routeTree.gen.ts` committed and review generated changes.

## Skill maintenance

The skills are versioned with this template. When a capability changes, update its workflow,
operations guidance, and any cross-links together. Validate frontmatter and links, then run
the skill against a disposable application with realistic product requirements. Database and
authentication skills should be exercised with real isolated PostgreSQL and browser sessions,
including direct protected calls and denied registration. Do not copy the exercise's product
tables or optional dependencies into the base template.

## Before publishing this repository

1. Complete the local checks: frozen install, `pnpm check`, `pnpm build`,
   `pnpm test:e2e`, browser review, skill validation, and a security audit.
2. Choose a GitHub owner/repository, visibility, and copyright holder. Add the chosen license
   text and attribution; do not publish a placeholder license.
3. Create the GitHub repository, push the reviewed files, and enable **Template repository**.
   Configure branch protection to require the CI check. Enable Dependabot security alerts and
   secret scanning where the account supports them.
4. Observe a real GitHub Actions run on the default branch and a pull request. Confirm
   generated-route drift is detected and E2E passes on the hosted runner.
5. Create a new repository from the GitHub template. Follow the README from a clean clone,
   then exercise one bootstrap profile and confirm optional capabilities are absent until added.
6. On the actual deployment, verify a request ID in stdout logs and a real Vercel invocation
   delivering logs, metrics, and traces to the configured OTLP receiver.

The original template and each generated project may have different license needs. Set the
template's license deliberately before publication and review the generated project's license
as part of its bootstrap.
