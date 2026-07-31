import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { getPublishedPosts } from '../lib/content/public-content.mjs'

const DEFAULT_BASE_URL = 'http://127.0.0.1:3211'
const DEFAULT_OUTPUT = '.omx/evidence/G005/public-content-smoke.json'

function routeFromPath(filePath) {
  return `/${filePath.replace(/^data\/|\.mdx$/g, '')}`
}

function extractFeedSlugs(feed) {
  return [...feed.matchAll(/<guid>[^<]+\/blog\/([^<]+)<\/guid>/g)].map((match) => match[1]).sort()
}

function extractSitemapSlugs(sitemap) {
  return [...sitemap.matchAll(/<loc>[^<]+\/blog\/([^<]+)<\/loc>/g)].map((match) => match[1]).sort()
}

async function fetchRoute(baseUrl, route) {
  const response = await fetch(new URL(route, baseUrl), { redirect: 'manual' })
  return { route, status: response.status, body: await response.text() }
}

export async function runPublicContentSmoke({
  baseUrl = process.env.SITE_BASE_URL || DEFAULT_BASE_URL,
} = {}) {
  const baseline = JSON.parse(readFileSync('tests/fixtures/content-manifest-baseline.json', 'utf8'))
  const publishedPosts = getPublishedPosts(allBlogs)
  const expectedSlugs = publishedPosts.map(({ slug }) => slug).sort()
  const publicRoutes = publishedPosts.map(({ slug }) => `/blog/${slug}`)
  const privateRoutes = baseline.files
    .filter(({ extension, draft }) => extension === '.mdx' && draft !== false)
    .map(({ path: filePath }) => routeFromPath(filePath))

  const [publicResponses, privateResponses, searchResponse, feedResponse, sitemapResponse] =
    await Promise.all([
      Promise.all(publicRoutes.map((route) => fetchRoute(baseUrl, route))),
      Promise.all(privateRoutes.map((route) => fetchRoute(baseUrl, route))),
      fetchRoute(baseUrl, '/search.json'),
      fetchRoute(baseUrl, '/feed.xml'),
      fetchRoute(baseUrl, '/sitemap.xml'),
    ])

  const searchSlugs = JSON.parse(searchResponse.body)
    .map(({ slug }) => slug)
    .sort()
  const feedSlugs = extractFeedSlugs(feedResponse.body)
  const sitemapSlugs = extractSitemapSlugs(sitemapResponse.body)
  const failures = [
    ...publicResponses
      .filter(({ status }) => status !== 200)
      .map(({ route, status }) => `${route} expected 200, received ${status}`),
    ...privateResponses
      .filter(({ status }) => status !== 404)
      .map(({ route, status }) => `${route} expected 404, received ${status}`),
  ]

  for (const [projection, actual] of [
    ['search', searchSlugs],
    ['feed', feedSlugs],
    ['sitemap', sitemapSlugs],
  ]) {
    if (JSON.stringify(actual) !== JSON.stringify(expectedSlugs)) {
      failures.push(`${projection} membership differs from the central selector`)
    }
  }

  return {
    ok: failures.length === 0,
    baseUrl,
    counts: {
      published: publicRoutes.length,
      private: privateRoutes.length,
      search: searchSlugs.length,
      feed: feedSlugs.length,
      sitemap: sitemapSlugs.length,
    },
    failures,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const writeIndex = args.indexOf('--write')
  const outputPath = writeIndex >= 0 ? args[writeIndex + 1] || DEFAULT_OUTPUT : null
  const result = await runPublicContentSmoke()

  if (outputPath) {
    mkdirSync(path.dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (!result.ok) process.exitCode = 1
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
