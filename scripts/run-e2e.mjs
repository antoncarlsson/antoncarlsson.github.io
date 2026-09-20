import { spawnSync } from 'node:child_process'
import { createServer } from 'node:net'

async function reservePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not reserve a test port')
  return { server, port: address.port }
}

const site = await reservePort()
let fixtures
try {
  fixtures = await reservePort()
} finally {
  await new Promise((resolve) => site.server.close(resolve))
}
await new Promise((resolve) => fixtures.server.close(resolve))

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(command, ['--filter', '@workspace/web', 'test:e2e'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E_SITE_PORT: String(site.port),
    E2E_FIXTURE_PORT: String(fixtures.port),
  },
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
