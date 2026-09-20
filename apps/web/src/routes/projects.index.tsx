import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '../config/site'
import { ContentList } from '../features/content/components/content-list'
export const Route = createFileRoute('/projects/')({
  head: () =>
    pageHead(
      'Projects',
      'A collection of things I’m building, exploring, and learning from.',
      '/projects',
    ),
  component: Page,
})
function Page() {
  return (
    <section className="index-page">
      <header className="page-heading">
        <p className="eyebrow">Notebook / Projects</p>
        <h1>Projects</h1>
        <p className="lede">A collection of things I’m building, exploring, and learning from.</p>
      </header>
      <ContentList kind="projects" />
    </section>
  )
}
