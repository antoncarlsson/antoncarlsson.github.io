import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { readContent, staticAssets } from './src/features/content/content-build'
import { contentPlugin } from './src/features/content/content-plugin'
import { highlighter } from './src/features/content/highlight'
import { site } from './src/config/site'

export default defineConfig(({ command }) => {
  const fixtures = process.env.CONTENT_TEST_FIXTURES === '1'
  const entries = readContent(
    resolve(fixtures ? 'tests/fixtures/content' : 'content'),
    command === 'serve',
  )
  return {
    base: '/',
    resolve: { tsconfigPaths: true },
    plugins: [
      contentPlugin(entries),
      mdx({
        include: /\.mdx$/,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          [rehypeHighlightCodeBlocks, { highlighter }],
        ],
      }),
      tailwindcss(),
      tanstackStart({
        prerender: {
          enabled: true,
          autoSubfolderIndex: true,
          autoStaticPathsDiscovery: false,
          crawlLinks: false,
          failOnError: true,
        },
        pages: [
          '/',
          '/projects',
          '/blog',
          '/about',
          '/404',
          ...entries.map(({ meta }) => meta.path),
        ].map((path) => ({ path })),
        importProtection: {
          behavior: 'error',
          include: ['src/**', '../../packages/*/src/**'],
          client: {
            files: [
              '**/*.server.*',
              '**/server/**',
              '**/env/server.ts',
              '**/content-build.ts',
              '**/content-plugin.ts',
            ],
            specifiers: ['@workspace/db', '@workspace/db/*', '@workspace/auth/server'],
          },
        },
      }),
      react(),
      {
        name: 'portfolio-static-assets',
        generateBundle() {
          if (this.environment.name !== 'client') return
          for (const [fileName, source] of Object.entries(staticAssets(entries, site)))
            this.emitFile({ type: 'asset', fileName, source })
        },
      },
      nitro({
        defaultPreset: 'node-server',
        ...(fixtures
          ? {
              output: {
                dir: '.output-fixtures',
                publicDir: '.output-fixtures/public',
                serverDir: '.output-fixtures/server',
              },
            }
          : {}),
      }),
    ],
  }
})
