import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

function loadConfig(environment = {}) {
  const output = execFileSync(
    process.execPath,
    [
      '-e',
      `
        const factory = require('./next.config.js')
        const config = factory()
        config.headers().then((headers) => {
          process.stdout.write(JSON.stringify({ output: config.output, images: config.images, headers }))
        })
      `,
    ],
    {
      cwd: root,
      env: { ...process.env, ...environment },
      encoding: 'utf8',
    }
  )

  return JSON.parse(output)
}

test('the default server build uses standalone output', () => {
  const config = loadConfig({ EXPORT: '' })

  assert.equal(config.output, 'standalone')
  assert.deepEqual(config.images.remotePatterns.map(({ hostname }) => hostname).sort(), [
    'cdn.prod.website-files.com',
    'i.namu.wiki',
    'orangematter.solarwinds.com',
    'repository-images.githubusercontent.com',
    'upload.wikimedia.org',
    'vanilla-extract.style',
  ])
})

test('the static export fallback remains available', () => {
  const config = loadConfig({ EXPORT: '1' })

  assert.equal(config.output, 'export')
})

test('security headers use a narrow production CSP', () => {
  const config = loadConfig({ NODE_ENV: 'production' })
  const headerMap = new Map(config.headers[0].headers.map(({ key, value }) => [key, value]))
  const csp = headerMap.get('Content-Security-Policy')

  assert.equal(config.headers[0].source, '/(.*)')
  assert.match(csp, /default-src 'self'/)
  assert.match(csp, /object-src 'none'/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.match(csp, /connect-src 'self'/)
  assert.match(csp, /https:\/\/giscus\.app/)
  assert.match(csp, /script-src[^;]*https:\/\/cloud\.umami\.is/)
  assert.match(csp, /connect-src[^;]*https:\/\/cloud\.umami\.is/)
  assert.match(csp, /connect-src[^;]*https:\/\/gateway\.umami\.is/)
  assert.doesNotMatch(csp, /https:\/\/analytics\.umami\.is/)
  assert.match(csp, /upgrade-insecure-requests/)
  assert.doesNotMatch(csp, /connect-src \*/)
  assert.doesNotMatch(csp, /unsafe-eval/)
  assert.equal(headerMap.get('X-Content-Type-Options'), 'nosniff')
  assert.equal(headerMap.get('X-Frame-Options'), 'DENY')
  assert.equal(headerMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
})

test('development CSP keeps the eval allowance required by the dev runtime', () => {
  const config = loadConfig({ NODE_ENV: 'development' })
  const csp = config.headers[0].headers.find(({ key }) => key === 'Content-Security-Policy').value

  assert.match(csp, /unsafe-eval/)
  assert.doesNotMatch(csp, /upgrade-insecure-requests/)
})

test('health and instrumentation expose only bounded release diagnostics', async () => {
  const healthSource = await readFile(
    new URL('../app/api/health/route.ts', import.meta.url),
    'utf8'
  )
  const instrumentationSource = await readFile(
    new URL('../instrumentation.ts', import.meta.url),
    'utf8'
  )

  assert.match(healthSource, /status: 'ok'/)
  assert.match(healthSource, /Cache-Control/)
  assert.match(healthSource, /RELEASE_SHA/)
  assert.match(healthSource, /dynamic = 'force-static'/)
  assert.match(instrumentationSource, /'app\.start'/)
  assert.match(instrumentationSource, /'request\.error'/)
  assert.doesNotMatch(instrumentationSource, /process\.env[),]/)
})

test('container and compose contracts are immutable and non-root', async () => {
  const [dockerfile, compose, dockerignore, smokeScript, postbuildScript, packageJson] =
    await Promise.all([
      readFile(new URL('../Dockerfile', import.meta.url), 'utf8'),
      readFile(new URL('../deploy/compose.yaml', import.meta.url), 'utf8'),
      readFile(new URL('../.dockerignore', import.meta.url), 'utf8'),
      readFile(new URL('../scripts/container-smoke.mjs', import.meta.url), 'utf8'),
      readFile(new URL('../scripts/postbuild.mjs', import.meta.url), 'utf8'),
      readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
    ])

  assert.match(dockerfile, /ARG NODE_VERSION=24\.18\.0/)
  assert.match(dockerfile, /yarn install --immutable/)
  assert.match(dockerfile, /RUN test -n "\$\{RELEASE_SHA\}"/)
  assert.match(dockerfile, /ARG NEXT_PUBLIC_GISCUS_REPO/)
  assert.match(dockerfile, /NEXT_PUBLIC_GISCUS_CATEGORY_ID=\$\{NEXT_PUBLIC_GISCUS_CATEGORY_ID\}/)
  assert.match(dockerfile, /COPY --from=builder .*\/\.next\/standalone/)
  assert.doesNotMatch(dockerfile, /COPY --from=builder .*\/\.next\/static/)
  assert.doesNotMatch(dockerfile, /COPY --from=builder .*\/public/)
  assert.match(dockerfile, /USER 10001:10001/)
  assert.match(dockerfile, /\/api\/health/)
  assert.doesNotMatch(dockerfile, /replace\(from,to\)/)

  assert.match(compose, /read_only: true/)
  assert.match(compose, /cap_drop:\s*\n\s+- ALL/)
  assert.match(compose, /no-new-privileges:true/)
  assert.match(compose, /\/app\/\.next\/cache/)
  assert.match(compose, /stop_signal: SIGTERM/)
  assert.match(compose, /RELEASE_SHA:\?Set RELEASE_SHA to the immutable Git SHA/)
  assert.match(compose, /NEXT_PUBLIC_GISCUS_REPO: \$\{NEXT_PUBLIC_GISCUS_REPO:-\}/)
  assert.match(compose, /NEXT_PUBLIC_GISCUS_CATEGORY_ID: \$\{NEXT_PUBLIC_GISCUS_CATEGORY_ID:-\}/)

  assert.match(dockerignore, /^\.env$/m)
  assert.match(dockerignore, /^\.env\.\*$/m)
  assert.match(dockerignore, /^\.omx$/m)
  assert.match(
    smokeScript,
    /const stopExitCode = startedContainer \? stopContainer\(startedContainer, true\) : null/
  )
  assert.match(postbuildScript, /bundleStandaloneAssets/)
  assert.match(postbuildScript, /await cp\('public', standalonePublic/)
  assert.match(postbuildScript, /await cp\(path\.join\('\.next', 'static'\), standaloneStatic/)
  assert.equal(packageJson.scripts.start, 'node .next/standalone/server.js')
})
