import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export const BLOG_DIR = 'data/blog'
export const BASELINE_PATH = 'tests/fixtures/content-manifest-baseline.json'

const CONTENT_EXTENSIONS = new Set(['.md', '.mdx'])

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function listContentFiles(dir = BLOG_DIR) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listContentFiles(fullPath))
      continue
    }

    if (entry.isFile() && CONTENT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(toPosixPath(fullPath))
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

function getTrackedFiles() {
  try {
    return new Set(
      execFileSync('git', ['ls-files', '-z', BLOG_DIR], { encoding: 'utf8' })
        .split('\0')
        .filter(Boolean)
        .map(toPosixPath)
    )
  } catch {
    return new Set()
  }
}

function parseDraftFlag(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
  if (!frontmatter) return null

  const match = frontmatter.match(/^draft:\s*(true|false)\s*$/m)
  if (!match) return null
  return match[1] === 'true'
}

function hashContent(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function buildManifest({ includeUntracked = true } = {}) {
  const trackedFiles = getTrackedFiles()
  const contentFiles = listContentFiles().filter(
    (filePath) => includeUntracked || trackedFiles.has(filePath)
  )
  const files = contentFiles.map((filePath) => {
    const buffer = readFileSync(filePath)
    const source = buffer.toString('utf8')
    const extension = path.extname(filePath)
    const draft = parseDraftFlag(source)
    const stat = statSync(filePath)

    return {
      path: filePath,
      extension,
      sha256: hashContent(buffer),
      bytes: stat.size,
      draft,
      gitTracked: trackedFiles.has(filePath),
      contentlayerEligible: extension === '.mdx',
    }
  })

  const mdxFiles = files.filter((file) => file.extension === '.mdx')
  const markdownFiles = files.filter((file) => file.extension === '.md')
  const explicitDraftTrue = files.filter((file) => file.draft === true)
  const explicitDraftFalse = files.filter((file) => file.draft === false)
  const mdxDraftFalse = mdxFiles.filter((file) => file.draft === false)
  const mdxMissingDraft = mdxFiles.filter((file) => file.draft === null)

  return {
    schemaVersion: 1,
    root: BLOG_DIR,
    counts: {
      totalFiles: files.length,
      mdxFiles: mdxFiles.length,
      markdownFiles: markdownFiles.length,
      explicitDraftTrue: explicitDraftTrue.length,
      explicitDraftFalse: explicitDraftFalse.length,
      mdxDraftTrue: mdxFiles.filter((file) => file.draft === true).length,
      mdxDraftFalse: mdxDraftFalse.length,
      mdxMissingDraft: mdxMissingDraft.length,
      publishedMdx: mdxDraftFalse.length,
      publicCandidateMdx: mdxFiles.filter((file) => file.draft !== true).length,
      markdownPreservedOnly: markdownFiles.length,
      missingDraftField: files.filter((file) => file.draft === null).length,
      gitTracked: files.filter((file) => file.gitTracked).length,
      gitUntracked: files.filter((file) => !file.gitTracked).length,
    },
    untrackedPaths: files.filter((file) => !file.gitTracked).map((file) => file.path),
    files,
  }
}

export function loadBaseline(baselinePath = BASELINE_PATH) {
  return JSON.parse(readFileSync(baselinePath, 'utf8'))
}

function difference(left, right) {
  const rightSet = new Set(right)
  return left.filter((item) => !rightSet.has(item))
}

export function compareBaseline(
  current = buildManifest({ includeUntracked: false }),
  baseline = loadBaseline()
) {
  const currentPaths = current.files.map((file) => file.path)
  const baselinePaths = baseline.files.map((file) => file.path)
  const baselineByPath = new Map(baseline.files.map((file) => [file.path, file]))
  const changedFiles = current.files
    .filter(
      (file) =>
        baselineByPath.has(file.path) && baselineByPath.get(file.path).sha256 !== file.sha256
    )
    .map((file) => file.path)

  const countMismatches = Object.keys(baseline.counts)
    .filter((key) => baseline.counts[key] !== current.counts[key])
    .map((key) => ({
      key,
      expected: baseline.counts[key],
      actual: current.counts[key],
    }))

  return {
    ok:
      changedFiles.length === 0 &&
      countMismatches.length === 0 &&
      difference(baselinePaths, currentPaths).length === 0 &&
      difference(currentPaths, baselinePaths).length === 0,
    changedFiles,
    missingFiles: difference(baselinePaths, currentPaths),
    addedFiles: difference(currentPaths, baselinePaths),
    countMismatches,
  }
}

function writeBaseline() {
  const manifest = buildManifest({ includeUntracked: false })
  mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
  writeFileSync(BASELINE_PATH, JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

function main() {
  const args = new Set(process.argv.slice(2))

  if (args.has('--write-baseline')) {
    printResult(writeBaseline())
    return
  }

  if (args.has('--print')) {
    printResult(buildManifest())
    return
  }

  if (!existsSync(BASELINE_PATH)) {
    throw new Error(
      `Missing baseline at ${BASELINE_PATH}. Run: node scripts/content-manifest.mjs --write-baseline`
    )
  }

  const result = compareBaseline()
  printResult(result)

  if (!result.ok) {
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
