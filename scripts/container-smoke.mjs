import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const DEFAULT_PORT = 3317
const DEFAULT_ROUTES = ['/', '/blog', '/careers', '/company']
const DEFAULT_ASSETS = ['/feed.xml', '/search.json', '/static/favicons/favicon.ico']
const SECRET_PATTERNS = [
  /CONTAINER_SMOKE_SECRET_CANARY/i,
  /DATABASE_URL/i,
  /GITHUB_TOKEN/i,
  /NPM_TOKEN/i,
  /PRIVATE_KEY/i,
  /PASSWORD=/i,
  /SECRET=/i,
]

function parseArgs(argv) {
  const args = {
    assets: [...DEFAULT_ASSETS],
    routes: [...DEFAULT_ROUTES],
    port: DEFAULT_PORT,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--url') args.url = argv[++index]
    else if (arg === '--image') args.image = argv[++index]
    else if (arg === '--container') args.container = argv[++index]
    else if (arg === '--release') args.release = argv[++index]
    else if (arg === '--port') args.port = Number(argv[++index])
    else if (arg === '--route') args.routes.push(argv[++index])
    else if (arg === '--asset') args.assets.push(argv[++index])
    else if (arg === '--help') args.help = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

function usage() {
  return `Usage:
  node scripts/container-smoke.mjs --url http://127.0.0.1:3000 [--release <sha>]
  node scripts/container-smoke.mjs --image moel-engineering:smoke [--release <sha>] [--port 3317]
  node scripts/container-smoke.mjs --container <name-or-id> --url http://127.0.0.1:3000 [--release <sha>]
`
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })
  if (result.error) throw result.error
  return result
}

function docker(args, options) {
  return run('docker', args, options)
}

function requireDocker() {
  const result = docker(['version', '--format', '{{.Server.Version}}'])
  if (result.status !== 0) {
    throw new Error(`Docker is not available: ${result.stderr.trim() || result.stdout.trim()}`)
  }
}

function normalizeBaseUrl(url) {
  return url.endsWith('/') ? url : `${url}/`
}

async function waitForHealth(baseUrl, timeoutMs = 45_000) {
  const startedAt = Date.now()
  let lastError = null
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(new URL('/api/health', baseUrl), { cache: 'no-store' })
      const body = await response.text()
      if (response.ok) return { response, body }
      lastError = new Error(`/api/health returned ${response.status}: ${body.slice(0, 180)}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw lastError ?? new Error('/api/health did not become ready')
}

async function fetchText(baseUrl, path) {
  const response = await fetch(new URL(path, baseUrl), {
    cache: 'no-store',
    headers: { 'user-agent': 'moel-container-smoke/1.0' },
    redirect: 'manual',
  })
  const body = await response.text()
  return {
    path,
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    body,
  }
}

function assertNoSecretLeak(path, body, secretCanary) {
  if (body.includes(secretCanary)) {
    throw new Error(`${path} leaked the smoke secret canary`)
  }
  const leakedPattern = SECRET_PATTERNS.find((pattern) => pattern.test(body))
  if (leakedPattern) {
    throw new Error(`${path} contains secret-like marker ${leakedPattern}`)
  }
}

function assertRelease(healthBody, expectedRelease) {
  if (!expectedRelease) return
  if (!healthBody.includes(expectedRelease)) {
    throw new Error(`/api/health does not include expected release ${expectedRelease}`)
  }
}

function assertSearch(body) {
  const parsed = JSON.parse(body)
  if (!Array.isArray(parsed)) throw new Error('/search.json is not a JSON array')
}

function assertFeed(body) {
  if (!/<rss|<feed/i.test(body)) throw new Error('/feed.xml is not RSS/Atom XML')
}

function inspectContainerUser(container) {
  const result = docker([
    'exec',
    container,
    'node',
    '-e',
    'console.log(`${process.getuid()}:${process.getgid()}`)',
  ])
  if (result.status !== 0) throw new Error(`Could not inspect container user: ${result.stderr}`)
  const user = result.stdout.trim()
  if (user === '0:0' || user.startsWith('0:')) {
    throw new Error(`Container is running as root (${user})`)
  }
  return user
}

function startContainer({ image, port, release, secretCanary }) {
  requireDocker()
  const name = `moel-container-smoke-${process.pid}-${Date.now()}`
  const result = docker([
    'run',
    '--detach',
    '--name',
    name,
    '--read-only',
    '--tmpfs',
    '/tmp:rw,noexec,nosuid,size=64m',
    '--tmpfs',
    '/app/.next/cache:rw,noexec,nosuid,size=128m',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges:true',
    '--init',
    '--stop-timeout',
    '30',
    '-e',
    'NODE_ENV=production',
    '-e',
    'HOSTNAME=0.0.0.0',
    '-e',
    'PORT=3000',
    '-e',
    `RELEASE_SHA=${release ?? 'smoke'}`,
    '-e',
    `CONTAINER_SMOKE_SECRET_CANARY=${secretCanary}`,
    '-p',
    `127.0.0.1:${port}:3000`,
    image,
  ])
  if (result.status !== 0) {
    throw new Error(`docker run failed: ${result.stderr.trim() || result.stdout.trim()}`)
  }
  return name
}

function stopContainer(container, remove = false) {
  const stopped = docker(['stop', '--time', '30', container])
  if (stopped.status !== 0) {
    throw new Error(`docker stop failed: ${stopped.stderr.trim() || stopped.stdout.trim()}`)
  }
  const inspected = docker(['inspect', '--format', '{{.State.ExitCode}}', container])
  if (inspected.status !== 0) {
    throw new Error(`docker inspect after stop failed: ${inspected.stderr}`)
  }
  const exitCode = inspected.stdout.trim()
  if (remove) docker(['rm', container])
  if (exitCode !== '0' && exitCode !== '143') {
    throw new Error(`container stopped with unexpected exit code ${exitCode}`)
  }
  return exitCode
}

async function runSmoke(args) {
  const secretCanary = `smoke-${randomBytes(12).toString('hex')}`
  const startedContainer = args.image
    ? startContainer({ image: args.image, port: args.port, release: args.release, secretCanary })
    : null
  const container = startedContainer ?? args.container
  const baseUrl = normalizeBaseUrl(args.url ?? `http://127.0.0.1:${args.port}`)
  const checked = []
  try {
    const health = await waitForHealth(baseUrl)
    assertRelease(health.body, args.release)
    assertNoSecretLeak('/api/health', health.body, secretCanary)
    checked.push({ path: '/api/health', status: health.response.status })

    for (const route of args.routes) {
      const result = await fetchText(baseUrl, route)
      if (result.status !== 200) throw new Error(`${route} returned ${result.status}`)
      assertNoSecretLeak(route, result.body, secretCanary)
      checked.push({ path: route, status: result.status, contentType: result.contentType })
    }

    for (const asset of args.assets) {
      const result = await fetchText(baseUrl, asset)
      if (result.status !== 200) throw new Error(`${asset} returned ${result.status}`)
      assertNoSecretLeak(asset, result.body, secretCanary)
      if (asset === '/search.json') assertSearch(result.body)
      if (asset === '/feed.xml') assertFeed(result.body)
      checked.push({ path: asset, status: result.status, contentType: result.contentType })
    }

    const runtimeUser = container ? inspectContainerUser(container) : null
    const stopExitCode = startedContainer ? stopContainer(startedContainer, true) : null

    return {
      ok: true,
      baseUrl,
      release: args.release ?? null,
      container: container ?? null,
      runtimeUser,
      stopExitCode,
      checked,
    }
  } catch (error) {
    if (startedContainer) {
      docker(['logs', '--tail', '120', startedContainer], { stdio: 'inherit' })
      docker(['rm', '--force', startedContainer])
    }
    throw error
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || (!args.url && !args.image)) {
    process.stdout.write(usage())
    process.exitCode = args.help ? 0 : 1
    return
  }

  const result = await runSmoke(args)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`)
    process.exitCode = 1
  })
}
