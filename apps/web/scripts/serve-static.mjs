import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve(process.argv[2] || '.output/public')
const port = Number(process.env.PORT || 3000)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
}
const server = createServer((request, response) => {
  void (async () => {
    if (!['GET', 'HEAD'].includes(request.method || '')) {
      response.writeHead(405)
      response.end()
      return
    }
    let path
    try {
      path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
    } catch {
      response.writeHead(400)
      response.end()
      return
    }
    let filename = resolve(root, `.${path}`)
    if (filename !== root && !filename.startsWith(root + sep)) {
      response.writeHead(403)
      response.end()
      return
    }
    let status = 200
    try {
      if ((await stat(filename)).isDirectory()) {
        if (!path.endsWith('/')) {
          response.writeHead(301, {
            Location: `${path}/${new URL(request.url || '/', 'http://localhost').search}`,
          })
          response.end()
          return
        }
        filename = resolve(filename, 'index.html')
      }
      await stat(filename)
    } catch {
      filename = resolve(root, '404.html')
      status = 404
    }
    const body = await readFile(filename)
    response.writeHead(status, {
      'Content-Type': types[extname(filename)] || 'application/octet-stream',
    })
    response.end(request.method === 'HEAD' ? undefined : body)
  })().catch(() => {
    response.writeHead(500)
    response.end('Static preview failed')
  })
})
server.listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}`))
