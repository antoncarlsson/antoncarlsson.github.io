import { createThemeCss, createThemeRule } from '@tanstack/highlight/theme'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'

export const highlightThemeCss = `${createThemeCss({
  light: githubLightTheme,
  lightSelector: '.prose',
  codeBlockSelector: '.prose pre',
})}
@media (prefers-color-scheme: dark) { ${createThemeRule('.prose', githubDarkTheme)} }
`
