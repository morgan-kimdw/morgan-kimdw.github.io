import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { buildManifest } from './content-manifest.mjs'

export const BASELINE_SNAPSHOT_PATH = 'tests/fixtures/site-baseline.json'

const require = createRequire(import.meta.url)

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function safeExec(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8' }).trim()
  } catch (error) {
    return {
      unavailable: true,
      command: [command, ...args].join(' '),
      message: error.message,
    }
  }
}

function walkFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return []

  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate))
    } else if (entry.isFile() && predicate(fullPath)) {
      files.push(toPosixPath(fullPath))
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

function appPathToRoute(filePath) {
  const route = filePath
    .replace(/^app\//, '/')
    .replace(/\/page\.[^.]+$/, '')
    .replace(/\/route\.[^.]+$/, '')
    .replace(/\/sitemap\.[^.]+$/, '/sitemap.xml')
    .replace(/\/robots\.[^.]+$/, '/robots.txt')

  return route === '' ? '/' : route
}

function getAppRoutes() {
  return walkFiles('app', (filePath) =>
    /\/(page|route|sitemap|robots)\.(ts|tsx|js|jsx)$/.test(toPosixPath(filePath))
  ).map((filePath) => ({
    filePath,
    route: appPathToRoute(filePath),
  }))
}

function getHeaderNavLinks() {
  const source = readFileSync('data/headerNavLinks.ts', 'utf8')
  return [...source.matchAll(/\{\s*href:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'\s*\}/g)].map(
    ([, href, title]) => ({ href, title })
  )
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function summarizePackageJson() {
  const packageJson = readJson('package.json')
  return {
    packageManager: packageJson.packageManager,
    scripts: packageJson.scripts,
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    dependencyCount: Object.keys(packageJson.dependencies || {}).length,
    devDependencyCount: Object.keys(packageJson.devDependencies || {}).length,
  }
}

function countXmlItems(filePath) {
  if (!existsSync(filePath)) return null
  const source = readFileSync(filePath, 'utf8')
  return {
    path: filePath,
    bytes: statSync(filePath).size,
    itemCount: (source.match(/<item>/g) || []).length,
    urlCount: (source.match(/<url>/g) || []).length,
  }
}

function summarizeGeneratedPublicArtifacts() {
  const feedFiles = walkFiles('public', (filePath) => path.basename(filePath) === 'feed.xml')
  return {
    feedFiles: feedFiles.map(countXmlItems),
    searchJson: existsSync('public/search.json')
      ? {
          path: 'public/search.json',
          bytes: statSync('public/search.json').size,
          documents: readJson('public/search.json').length,
        }
      : null,
    tagData: existsSync('app/tag-data.json')
      ? {
          path: 'app/tag-data.json',
          tags: Object.keys(readJson('app/tag-data.json')).sort(),
        }
      : null,
  }
}

function summarizeContentRoutes(contentManifest) {
  const published = contentManifest.files
    .filter((file) => file.extension === '.mdx' && file.draft === false)
    .map((file) => `/${file.path.replace(/^data\//, '').replace(/\.mdx$/, '')}`)

  const missingDraft = contentManifest.files
    .filter((file) => file.extension === '.mdx' && file.draft === null)
    .map((file) => file.path)

  return {
    publishedBlogRoutes: published.sort((a, b) => a.localeCompare(b)),
    missingDraftPaths: missingDraft,
    publicCandidateMdxRoutes: contentManifest.files
      .filter((file) => file.extension === '.mdx' && file.draft !== true)
      .map((file) => `/${file.path.replace(/^data\//, '').replace(/\.mdx$/, '')}`)
      .sort((a, b) => a.localeCompare(b)),
  }
}

function findCustomMdxUsage(contentFiles) {
  const componentNames = ['TOCInline', 'Youtube']

  return Object.fromEntries(
    componentNames.map((componentName) => [
      componentName,
      {
        componentPath:
          componentName === 'Youtube' && existsSync('components/Youtube.tsx')
            ? 'components/Youtube.tsx'
            : null,
        usagePaths: contentFiles.filter((filePath) =>
          readFileSync(filePath, 'utf8').includes(componentName)
        ),
      },
    ])
  )
}

function summarizePerformanceArtifacts() {
  const buildManifestPath = '.next/build-manifest.json'
  const routesManifestPath = '.next/routes-manifest.json'

  return {
    nextBuildManifest: existsSync(buildManifestPath)
      ? {
          path: buildManifestPath,
          bytes: statSync(buildManifestPath).size,
          pages: Object.keys(readJson(buildManifestPath).pages || {}).sort(),
        }
      : null,
    nextRoutesManifest: existsSync(routesManifestPath)
      ? {
          path: routesManifestPath,
          bytes: statSync(routesManifestPath).size,
        }
      : null,
    publicAssetBytes: walkFiles('public/static').reduce(
      (sum, filePath) => sum + statSync(filePath).size,
      0
    ),
  }
}

export function buildBaselineSnapshot() {
  const contentManifest = buildManifest({ includeUntracked: false })
  const siteMetadata = require('../data/siteMetadata.js')

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    git: {
      branch: safeExec('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
      commit: safeExec('git', ['rev-parse', 'HEAD']),
    },
    runtime: {
      node: process.version,
      yarn: safeExec('yarn', ['--version']),
    },
    content: {
      counts: contentManifest.counts,
      untrackedPaths: contentManifest.untrackedPaths,
      ...summarizeContentRoutes(contentManifest),
      customMdxUsage: findCustomMdxUsage(contentManifest.files.map((file) => file.path)),
    },
    routes: {
      appRoutes: getAppRoutes(),
      headerNavLinks: getHeaderNavLinks(),
    },
    metadata: {
      title: siteMetadata.title,
      author: siteMetadata.author,
      description: siteMetadata.description,
      language: siteMetadata.language,
      locale: siteMetadata.locale,
      siteUrl: siteMetadata.siteUrl,
      commentsProvider: siteMetadata.comments?.provider,
      searchProvider: siteMetadata.search?.provider,
      analyticsProviders: Object.entries(siteMetadata.analytics || {})
        .filter(([, value]) => value && Object.keys(value).length > 0)
        .map(([key]) => key)
        .sort(),
    },
    packageJson: summarizePackageJson(),
    generatedArtifacts: summarizeGeneratedPublicArtifacts(),
    performanceArtifacts: summarizePerformanceArtifacts(),
    environmentContract: {
      nvmrc: existsSync('.nvmrc') ? readFileSync('.nvmrc', 'utf8').trim() : null,
      yarnrc: existsSync('.yarnrc.yml') ? readFileSync('.yarnrc.yml', 'utf8').trim() : null,
      referencedPublicEnvNames: [
        'BASE_PATH',
        'NEXT_UMAMI_ID',
        'NEXT_PUBLIC_GISCUS_REPO',
        'NEXT_PUBLIC_GISCUS_REPOSITORY_ID',
        'NEXT_PUBLIC_GISCUS_CATEGORY',
        'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
      ],
    },
  }
}

function writeSnapshot() {
  const snapshot = buildBaselineSnapshot()
  mkdirSync(path.dirname(BASELINE_SNAPSHOT_PATH), { recursive: true })
  writeFileSync(BASELINE_SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
  return snapshot
}

function main() {
  const args = new Set(process.argv.slice(2))
  const result = args.has('--write-baseline') ? writeSnapshot() : buildBaselineSnapshot()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
