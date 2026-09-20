import { copyFile, readFile, readdir, lstat } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const directory = resolve(
  process.argv.includes('--fixtures') ? '.output-fixtures/public' : '.output/public',
)
await copyFile(join(directory, '404/index.html'), join(directory, '404.html'))
const required = [
  'index.html',
  'projects/index.html',
  'blog/index.html',
  'about/index.html',
  '404.html',
  'rss.xml',
  'sitemap.xml',
  'robots.txt',
  '.nojekyll',
]
for (const file of required) await readFile(join(directory, file))
async function inspect(dir) {
  for (const item of await readdir(dir)) {
    const filename = join(dir, item)
    const stat = await lstat(filename)
    if (stat.isSymbolicLink()) throw new Error(`Unexpected symlink in Pages artifact: ${filename}`)
    if (stat.isDirectory()) {
      await inspect(filename)
      continue
    }
    if (/\.(mdx?|map)$/.test(item)) throw new Error(`Source file in Pages artifact: ${filename}`)
    if (/\.(html|js|xml|json|txt)$/.test(item)) {
      const content = await readFile(filename, 'utf8')
      if (/unpublished-(markdown|mdx|project)-example|excluded-fixture-draft/.test(content))
        throw new Error(`Draft leaked into ${filename}`)
    }
  }
}
await inspect(directory)
console.log('Static Pages artifact verified:', directory)
