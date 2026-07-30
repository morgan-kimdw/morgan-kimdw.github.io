import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_BASE_URL = 'http://localhost:3100'
const DEFAULT_OUTPUT = '.omx/evidence/G001/http-baseline.json'

function decodeHtml(value) {
  return value
    ?.replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function matchContent(html, pattern) {
  return decodeHtml(html.match(pattern)?.[1]?.trim()) ?? null
}

function defaultRoutes() {
  const siteBaseline = JSON.parse(readFileSync('tests/fixtures/site-baseline.json', 'utf8'))
  const representativePost = siteBaseline.content.publishedBlogRoutes[0]

  return ['/', '/blog', '/tags', representativePost]
}

async function inspectRoute(baseUrl, route) {
  const response = await fetch(new URL(route, baseUrl), {
    headers: { 'user-agent': 'morgan-site-baseline/1.0' },
    redirect: 'manual',
  })
  const html = await response.text()

  return {
    route,
    status: response.status,
    contentType: response.headers.get('content-type'),
    bytes: Buffer.byteLength(html),
    sha256: createHash('sha256').update(html).digest('hex'),
    title: matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    canonical: matchContent(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    ),
    description: matchContent(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    ),
    h1: matchContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g, '') ?? null,
  }
}

export async function buildHttpSnapshot({
  baseUrl = process.env.SITE_BASE_URL || DEFAULT_BASE_URL,
  routes = defaultRoutes(),
} = {}) {
  const results = []
  for (const route of routes) {
    results.push(await inspectRoute(baseUrl, route))
  }

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    baseUrl,
    routes: results,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const writeIndex = args.indexOf('--write')
  const outputPath = writeIndex >= 0 ? args[writeIndex + 1] || DEFAULT_OUTPUT : null
  const snapshot = await buildHttpSnapshot()

  if (outputPath) {
    mkdirSync(path.dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
  }

  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`)
  if (snapshot.routes.some(({ status }) => status < 200 || status >= 400)) {
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
