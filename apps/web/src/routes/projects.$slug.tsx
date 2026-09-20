import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '../config/site'
import { ContentPage, loadEntry } from '../features/content/components/content-page'
export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => loadEntry('projects', params.slug),
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(loaderData.title, loaderData.description, loaderData.path)
      : { meta: [{ name: 'robots', content: 'noindex' }] },
  component: Page,
})
function Page() {
  const { slug } = Route.useParams()
  return <ContentPage kind="projects" slug={slug} />
}
