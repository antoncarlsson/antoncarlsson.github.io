import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import type { ContentSource } from './content-build'
import { frontmatter } from './content-build'

export function contentPlugin(entries: ContentSource[]): Plugin {
  const id = 'virtual:content'
  return {
    name: 'portfolio-content',
    enforce: 'pre',
    resolveId(source) {
      if (source === id) return `\0${id}`
    },
    load(source) {
      if (source !== `\0${id}`) return
      return `import { lazy } from 'react';\nexport const entries = [${entries
        .map(({ meta, filename }) => {
          return `(() => { let promise; const load = () => promise ??= import(${JSON.stringify(filename)}); return { ...${JSON.stringify(meta)}, load, Component: lazy(load) }; })()`
        })
        .join(',\n')}];`
    },
    transform(source, filename) {
      if (!/\.mdx?$/.test(filename)) return
      const entry = entries.find((item) => item.filename === filename)
      if (!entry) return
      const { body } = frontmatter(source, filename)
      if (filename.endsWith('.mdx')) return { code: body, map: null }
      return {
        code: `import { Markdown } from '@tanstack/markdown/react';\nimport { createElement } from 'react';\nimport { highlightMarkdownCode } from ${JSON.stringify(resolve('src/features/content/highlight.ts'))};\nexport default function Content() { return createElement(Markdown, { highlighter: highlightMarkdownCode, headingIds: true, headingAnchors: true }, ${JSON.stringify(body)}); }`,
        map: null,
      }
    },
    configureServer(server) {
      // Restart config to rebuild the manifest when files or frontmatter change.
      server.watcher.on('all', (event, filename) => {
        if (
          ['add', 'change', 'unlink'].includes(event) &&
          /[/]content[/](blog|projects)[/].*\.mdx?$/.test(filename)
        ) {
          void server.restart()
        }
      })
    },
  }
}
