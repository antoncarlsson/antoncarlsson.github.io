declare module 'virtual:content' {
  import type { ContentMeta } from '@/features/content/content.schema'
  import type { ComponentType } from 'react'
  import type { MDXProps } from 'mdx/types'
  type ContentEntry = ContentMeta & {
    load: () => Promise<{ default: ComponentType<MDXProps> }>
    Component: ComponentType<MDXProps>
  }
  export const entries: ContentEntry[]
}
