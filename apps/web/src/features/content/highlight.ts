import { createHighlighter } from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'
import { ts } from '@tanstack/highlight/languages/ts'
import { jsx } from '@tanstack/highlight/languages/jsx'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { html } from '@tanstack/highlight/languages/html'
import { css } from '@tanstack/highlight/languages/css'
import { json } from '@tanstack/highlight/languages/json'
import { shell } from '@tanstack/highlight/languages/shell'
import { yaml } from '@tanstack/highlight/languages/yaml'
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'

export const highlighter = createHighlighter({
  languages: [js, ts, jsx, tsx, html, css, json, shell, yaml],
})
export const highlightMarkdownCode = createTanStackMarkdownHighlighter(highlighter)
