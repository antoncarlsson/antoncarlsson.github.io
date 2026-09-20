import { createFileRoute } from '@tanstack/react-router'
import { site } from '../config/site'
import { NotFoundPage } from '../components/error-page'
export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [{ title: `Page not found · ${site.name}` }, { name: 'robots', content: 'noindex' }],
  }),
  component: NotFoundPage,
})
