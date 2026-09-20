import { useForm } from '@tanstack/react-form'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { previewProject } from '../project-preview.functions'
import { projectPreviewSchema } from '../project-preview.schema'

type PreviewResult = Awaited<ReturnType<typeof previewProject>>

export function ProjectPreviewForm() {
  const runPreview = useServerFn(previewProject)
  const [result, setResult] = useState<PreviewResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { name: '', description: '' },
    validators: { onSubmit: projectPreviewSchema },
    onSubmit: async ({ value }) => {
      setResult(null)
      setRequestError(null)
      try {
        setResult(await runPreview({ data: projectPreviewSchema.parse(value) }))
      } catch {
        setRequestError('We couldn’t create your preview. Please try again.')
      }
    },
  })

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
      <form
        noValidate
        className="space-y-7"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Project name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Field Notes"
                maxLength={60}
                aria-invalid={!field.state.meta.isValid}
                aria-describedby="name-help name-error"
                className="h-12 bg-white"
              />
              <p id="name-help" className="text-xs text-muted-foreground">
                A few words to make it yours. 2–60 characters.
              </p>
              <p id="name-error" className="text-sm text-destructive">
                {field.state.meta.errors.map((error) => error?.message).join(' ')}
              </p>
            </div>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>What are you building?</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="A shared home for useful ideas and everyday discoveries."
                maxLength={280}
                rows={4}
                aria-invalid={!field.state.meta.isValid}
                aria-describedby="description-help description-error"
                className="resize-y bg-white"
              />
              <p id="description-help" className="text-xs text-muted-foreground">
                One clear sentence. 10–280 characters.
              </p>
              <p id="description-error" className="text-sm text-destructive">
                {field.state.meta.errors.map((error) => error?.message).join(' ')}
              </p>
            </div>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
              {isSubmitting ? 'Creating preview…' : 'Create preview'}
              <span aria-hidden="true">↗</span>
            </Button>
          )}
        </form.Subscribe>
        <p className="text-xs text-muted-foreground">
          Nothing is saved. This example doesn’t check name availability.
        </p>
        {requestError && (
          <p role="alert" className="text-sm text-destructive">
            {requestError}
          </p>
        )}
        {result && !result.ok && (
          <p role="alert" className="text-sm text-destructive">
            {result.message}
          </p>
        )}
      </form>
      <aside
        aria-label="Project preview"
        aria-live="polite"
        className="min-h-72 min-w-0 break-words rounded-xl border bg-white p-7 lg:p-9"
      >
        <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Your preview
        </p>
        {result?.ok ? (
          <>
            <div
              aria-hidden="true"
              className="mb-5 flex size-12 items-center justify-center rounded-xl bg-secondary text-xl text-primary"
            >
              ↗
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{result.preview.name}</h2>
            <p className="mt-3 break-words leading-relaxed text-muted-foreground">
              {result.preview.summary}
            </p>
            <p className="mt-8 break-all border-t pt-5 font-mono text-xs text-primary">
              /{result.preview.slug}
            </p>
          </>
        ) : (
          <div className="py-8">
            <div
              aria-hidden="true"
              className="mb-5 size-10 rounded-lg border border-dashed border-muted-foreground/40"
            />
            <h2 className="font-medium">An idea starts here.</h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Give your project a name and a purpose. Its preview will appear here.
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
