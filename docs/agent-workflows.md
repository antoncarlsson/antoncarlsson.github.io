# Agent workflows

Skills under `.agents/skills/` describe repeatable tasks. `AGENTS.md` carries repository-wide
rules; [architecture](architecture.md) explains boundaries; [conventions](conventions.md)
contains code placement and testing defaults. A skill links to these rather than copying them.

Start a new product with [bootstrap-application](../.agents/skills/bootstrap-application/SKILL.md).
Its landing-page, web-app, and SaaS references are profiles, not separate frameworks. The
bootstrap workflow selects capabilities from actual product requirements. A database requirement
uses [add-database](../.agents/skills/add-database/SKILL.md); authentication uses
[add-authentication](../.agents/skills/add-authentication/SKILL.md), which may depend on database
work. The base can serve a marketing page without either capability.

Use [add-feature](../.agents/skills/add-feature/SKILL.md) for product behavior, then
[verify-application](../.agents/skills/verify-application/SKILL.md) for an end-to-end gate.
[review-code](../.agents/skills/review-code/SKILL.md) inspects a change for correctness and
security before release. These workflows do not replace product decisions. Ask about access,
registration, tenancy, billing, external API consumers, and data requirements when they change
the design; decide familiar implementation details from repository conventions.

The skills are ordinary Markdown in the generated repository. If an agent host does not
automatically discover them, point the agent at the relevant `SKILL.md` by path.
