import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

export function ErrorPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-3 text-sm text-muted-foreground">Something went wrong</p>
      <h1 className="text-3xl font-semibold tracking-tight">We couldn’t load this page.</h1>
      <p className="my-6 text-muted-foreground">
        Please try again. If the problem continues, contact the application owner.
      </p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </section>
  )
}

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-3 font-mono text-sm text-muted-foreground">404 / Not found</p>
      <h1 className="text-3xl font-semibold tracking-tight">This page doesn’t exist.</h1>
      <p className="my-6 text-muted-foreground">Check the address or head back to the beginning.</p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </section>
  )
}
