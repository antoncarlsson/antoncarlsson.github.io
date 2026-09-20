import { createFileRoute, Link } from '@tanstack/react-router'
import { ProjectPreviewForm } from '../features/project-preview/components/project-preview-form'

export const Route = createFileRoute('/examples/project-preview')({
  head: () => ({ meta: [{ title: 'Project preview · AWesome Template' }] }),
  component: ProjectPreviewPage,
})

function ProjectPreviewPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to overview
      </Link>
      <div className="mb-12 mt-12 max-w-xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
          01 / Reference feature
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Give your idea a shape.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          A small, complete example: validated input, a server function, and independent business
          logic.
        </p>
      </div>
      <ProjectPreviewForm />
    </section>
  )
}
