# Web application profile

Identify the main user journey and whether it needs durable data or private access. Add a
responsive application shell only if it serves that journey. Use route loaders for simple
route-owned data and add Query for real shared caching or refresh behavior.

If the product needs records, apply the database skill before adding entities. If access must
be restricted, establish registration/provisioning policy and apply the authentication skill.
Build one representative feature with server validation, independent service logic, and tests.
Avoid general admin, notification, or settings frameworks without a product use.
