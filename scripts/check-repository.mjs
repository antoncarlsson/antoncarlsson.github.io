import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const failures = []

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => [])
  const nested = await Promise.all(
    entries.map((entry) => {
      const filename = path.join(directory, entry.name)
      return entry.isDirectory() ? files(filename) : [filename]
    }),
  )
  return nested.flat()
}

for (const filename of [...(await files('apps/web/src')), ...(await files('packages/ui/src'))]) {
  if (!/\.[cm]?tsx?$/.test(filename) || /\.(test|gen)\./.test(filename)) continue
  const source = await readFile(filename, 'utf8')
  const imports = ts.preProcessFile(source, true, true).importedFiles.map((item) => item.fileName)
  for (const specifier of imports) {
    const fail = (reason) => failures.push(`${filename}: ${reason} (${specifier})`)
    if (
      filename.startsWith('packages/ui/') &&
      /^(?:@\/|@workspace\/(?!ui\/)|node:)|(?:^|\/)apps\//.test(specifier)
    ) {
      fail('Shared UI cannot depend on application or server infrastructure')
    }
    if (
      filename.endsWith('.service.ts') &&
      specifier !== '@workspace/auth/types' &&
      /^(?:react(?:-dom)?(?:\/|$)|@tanstack\/|@workspace\/(?:ui|db|auth)(?:\/|$)|drizzle-orm|better-auth)|\.(?:repository|integration)(?:\.server)?(?:\.|$)/.test(
        specifier,
      )
    ) {
      fail('Services receive dependencies and must remain framework-independent')
    }
    if (
      filename.endsWith('.tsx') &&
      /\.service(?:\.|$)|\.repository(?:\.|$)|\.server(?:\.|$)|(?:^|\/)server(?:\/|$)|@workspace\/(?:db|auth\/server)/.test(
        specifier,
      )
    ) {
      fail('UI must use a server function instead of importing a private implementation')
    }
  }
}

for (const filename of (await files('.agents/skills')).filter((item) =>
  item.endsWith('/SKILL.md'),
)) {
  const source = await readFile(filename, 'utf8')
  const name = source.match(/^name: ([a-z0-9-]+)$/m)?.[1]
  if (!source.startsWith('---\n') || !name || !/^description: .+/m.test(source)) {
    failures.push(`${filename}: skill needs name and description frontmatter`)
  }
  if (name && path.basename(path.dirname(filename)) !== name)
    failures.push(`${filename}: name must match folder`)
  for (const [, target] of source.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    if (/^(?:https?:|mailto:)/.test(target)) continue
    const destination = path.resolve(path.dirname(filename), target)
    if (!destination.startsWith(`${root}${path.sep}`))
      failures.push(`${filename}: link escapes repository`)
    else
      await readFile(destination).catch(() => failures.push(`${filename}: broken link ${target}`))
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('Repository boundaries and skill references passed.')
}
