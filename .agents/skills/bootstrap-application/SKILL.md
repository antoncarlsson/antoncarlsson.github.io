---
name: bootstrap-application
description: Turn this generic template into a landing page, web app, or SaaS foundation based on explicit product requirements, adding only needed capabilities.
---

# Bootstrap an application

Read [architecture](../../../docs/architecture.md), [conventions](../../../docs/conventions.md),
and [agent workflows](../../../docs/agent-workflows.md). Inspect the current routes and packages;
preserve useful existing work.

1. Capture the product purpose, audience, primary journey, public versus internal access,
   data needs, and launch constraints. Clarify only decisions that change the implementation.
2. Choose the closest profile: [landing page](references/landing-page.md),
   [web application](references/web-app.md), or [SaaS](references/saas.md). The profile guides
   scope; it is not a command to install everything listed.
3. Write the actual product choices in `docs/product.md`. Choose a real app name and metadata;
   replace generic sample copy. Keep the reference feature only if it teaches useful behavior
   in the new product; otherwise remove it and its route/tests coherently.
4. Apply capabilities only where required. For persistence use
   [add-database](../add-database/SKILL.md); for login/sessions use
   [add-authentication](../add-authentication/SKILL.md). Run and verify each capability before
   building product features. Do not duplicate their implementation instructions here.
5. Build one representative journey via [add-feature](../add-feature/SKILL.md), including
   appropriate tests. Adjust navigation, errors, accessibility, responsive layout, and docs.
   Keep Pino logging and request telemetry; set a product-specific service name and record
   meaningful domain signals without personal data.
6. Run [verify-application](../verify-application/SKILL.md). Report product choices,
   capabilities actually installed, tests run, and external setup still required.

Do not add organizations, roles, payment, OAuth, analytics, or an independent API from the
profile label alone. An internal or customer-facing SaaS may have very different access rules.
