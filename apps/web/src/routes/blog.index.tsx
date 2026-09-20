import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '../config/site'
import { ContentList } from '../features/content/components/content-list'
export const Route = createFileRoute('/blog/')({
  head: () => pageHead('Writing', 'Ideas, observations, and notes from the process.', '/blog'),
  component: Page,
})
function Page() {
  return (
    <section className="index-page">
      <header className="page-heading">
        <p className="eyebrow">Notebook / Writing</p>
        <h1>Writing</h1>
        <p className="lede">Ideas, observations, and notes from the process.</p>
      </header>
      <ContentList kind="blog" />
    </section>
  )
}
