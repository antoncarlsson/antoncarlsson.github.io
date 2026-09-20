---
name: review-code
description: Review application changes for behavior, trust boundaries, architecture, tests, and deployment effects, reporting actionable findings by severity.
---

# Review code

Read [architecture](../../../docs/architecture.md), [conventions](../../../docs/conventions.md),
and the changed code with enough callers/tests to understand it. Determine the intended behavior
before judging the implementation.

Trace untrusted input through validation, authorization, service decisions, persistence, and
output. Check server/client imports and secret exposure; auth guard placement; resource ownership;
webhook signatures; migrations and data compatibility; session and cache isolation; error disclosure;
accessibility; and changed deployment inputs where relevant. Compare tests with failure modes,
including direct calls that bypass page navigation. Run focused checks when a suspected bug can
be reproduced safely.

For server changes, review Pino fields, redaction, request/trace correlation, and metric
cardinality. Check that OTLP export failures cannot fail requests or leak endpoint credentials,
and that a log backend does not ingest both stdout and direct OTLP copies.

Report concrete findings first, ordered by severity, with file/line and a scenario. Separate
verified bugs from risks or open product questions. Keep summaries short. If no findings are
supported, say so and name the material checks not run. Do not create speculative findings to
fill a review, or silently change product policy during a review.
