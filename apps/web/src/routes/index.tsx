import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <div className="grid items-start gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-7 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Ready for your next idea
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Start small.
            <br />
            <span className="text-primary">Build with intent.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            A TypeScript foundation for people and coding agents. Clear boundaries, a working
            example, and room to grow.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Button asChild className="h-12 px-6">
              <Link to="/examples/project-preview">
                Explore the example <span aria-hidden="true">↗</span>
              </Link>
            </Button>
            <a
              href="#foundation"
              className="text-sm font-medium underline decoration-border underline-offset-4"
            >
              See what’s included
            </a>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-7 lg:mt-6 lg:p-9">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            One feature. Clear boundaries.
          </p>
          <ol className="mt-8 space-y-6">
            {[
              ['01', 'Interface', 'React + accessible UI primitives'],
              ['02', 'Boundary', 'Validated TanStack server functions'],
              ['03', 'Domain', 'Independent, testable business logic'],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-5">
                <span className="pt-1 font-mono text-xs text-primary">{number}</span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t pt-5 text-xs text-muted-foreground">
            Add persistence and authentication when your product needs them.
          </p>
        </div>
      </div>
      <div id="foundation" className="mt-20 border-t pt-10 sm:mt-28">
        <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Thin template. Strong conventions.
        </p>
        <div className="grid gap-9 sm:grid-cols-3">
          {[
            [
              'A shared language',
              'Strict TypeScript, runtime validation, and one consistent way to organize features.',
            ],
            [
              'Confidence built in',
              'Fast checks, focused tests, and browser coverage against a real production build.',
            ],
            [
              'Complexity on demand',
              'Composable agent workflows add capabilities without turning every project into an enterprise starter.',
            ],
          ].map(([title, description]) => (
            <div key={title}>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
