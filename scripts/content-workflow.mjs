import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_AUDIT_PATH = 'var/audit/publishing.jsonl'
const SAFE_CONTENT_PATH = /^data\/(blog|jobs)\/[a-z0-9][a-z0-9/_-]*\.mdx$/

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function parseOptions(argv) {
  const options = {
    _: [],
    root: process.cwd(),
    auditPath: DEFAULT_AUDIT_PATH,
    dryRun: false,
    json: false,
    commit: false,
    push: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (['--dry-run', '--json', '--commit', '--push'].includes(arg)) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      options[key] = true
      continue
    }
    if (arg.startsWith('--')) {
      const [rawKey, inlineValue] = arg.slice(2).split('=', 2)
      const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      const value = inlineValue ?? argv[++index]
      if (!value) throw new Error(`Missing value for --${rawKey}`)
      options[key] = value
      continue
    }

    options._.push(arg)
  }

  return options
}

function resolveProjectPath(root, selectedPath) {
  if (!selectedPath) throw new Error('Missing --path data/blog/.../*.mdx or data/jobs/*.mdx')
  if (path.isAbsolute(selectedPath)) throw new Error('Use a repository-relative content path')

  const normalized = toPosixPath(path.normalize(selectedPath))
  if (!SAFE_CONTENT_PATH.test(normalized) || normalized.includes('/../')) {
    throw new Error(`Unsafe content path: ${selectedPath}`)
  }

  const rootPath = path.resolve(root)
  const absolutePath = path.resolve(rootPath, normalized)
  if (!absolutePath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error(`Path escapes project root: ${selectedPath}`)
  }

  return { normalized, absolutePath }
}

function contentKind(selectedPath) {
  return selectedPath.startsWith('data/jobs/') ? 'job' : 'blog'
}

function unquote(value = '') {
  return value.replace(/^['"]|['"]$/g, '').trim()
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return null

  const frontmatter = match[1]
  const fields = new Map()
  for (const line of frontmatter.split(/\r?\n/)) {
    const fieldMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (fieldMatch) fields.set(fieldMatch[1], fieldMatch[2].trim())
  }

  return {
    bodyStart: match[0].length,
    frontmatter,
    fields,
    raw: match[0],
  }
}

function parseDraftValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

function isValidDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match || Number.isNaN(Date.parse(value))) return false

  const [, year, month, day] = match.map(Number)
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  return (
    calendarDate.getUTCFullYear() === year &&
    calendarDate.getUTCMonth() === month - 1 &&
    calendarDate.getUTCDate() === day
  )
}

function listContentFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory)
  if (!existsSync(absoluteDirectory)) return []

  return readdirSync(absoluteDirectory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => toPosixPath(path.relative(root, path.join(entry.parentPath, entry.name))))
}

function assertUniqueSlug(root, selectedPath, fields) {
  if (contentKind(selectedPath) !== 'blog') return

  const routeSlug = unquote(fields.get('slug')) || selectedPath.replace(/^data\/blog\/|\.mdx$/g, '')
  if (!/^[a-z0-9][a-z0-9/_-]*$/.test(routeSlug)) {
    throw new Error(`Invalid slug in ${selectedPath}: ${routeSlug}`)
  }

  for (const candidatePath of listContentFiles(root, 'data/blog')) {
    if (candidatePath === selectedPath) continue
    const parsed = parseFrontmatter(readFileSync(path.join(root, candidatePath), 'utf8'))
    if (!parsed) continue
    const candidateSlug =
      unquote(parsed.fields.get('slug')) || candidatePath.replace(/^data\/blog\/|\.mdx$/g, '')
    if (candidateSlug === routeSlug) {
      throw new Error(`Duplicate slug "${routeSlug}" in ${selectedPath} and ${candidatePath}`)
    }
  }
}

function assertLocalAssetsExist(root, selectedPath, source) {
  const references = new Set()
  for (const match of source.matchAll(
    /!\[[^\]]*\]\((\/static\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g
  )) {
    references.add(match[1])
  }
  for (const match of source.matchAll(/\bsrc=["'](\/static\/[^"']+)["']/g)) {
    references.add(match[1])
  }
  for (const match of source.matchAll(/(?:hero|images):[^\n]*(\/static\/[A-Za-z0-9_./-]+)/g)) {
    references.add(match[1])
  }

  for (const reference of references) {
    const cleanReference = reference.split(/[?#]/, 1)[0]
    const assetPath = path.join(root, 'public', cleanReference.replace(/^\/+/, ''))
    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
      throw new Error(`Broken local asset reference in ${selectedPath}: ${reference}`)
    }
  }
}

export function validateContentFile({ root = process.cwd(), selectedPath }) {
  const { normalized, absolutePath } = resolveProjectPath(root, selectedPath)
  if (!existsSync(absolutePath)) throw new Error(`Content file does not exist: ${normalized}`)
  if (!statSync(absolutePath).isFile()) throw new Error(`Content path is not a file: ${normalized}`)

  const source = readFileSync(absolutePath, 'utf8')
  const parsed = parseFrontmatter(source)
  if (!parsed) throw new Error(`Missing frontmatter block: ${normalized}`)

  const kind = contentKind(normalized)
  const required =
    kind === 'job'
      ? [
          'title',
          'summary',
          'team',
          'location',
          'workingMode',
          'employmentType',
          'experience',
          'status',
          'draft',
          'postedAt',
          'applyUrl',
          'skills',
          'responsibilities',
          'qualifications',
        ]
      : ['title', 'date', 'draft']
  const missing = required.filter((field) => !parsed.fields.has(field))
  if (missing.length > 0) {
    throw new Error(`Missing required frontmatter field(s) in ${normalized}: ${missing.join(', ')}`)
  }

  const draft = parseDraftValue(parsed.fields.get('draft'))
  if (draft === null) throw new Error(`draft must be true or false in ${normalized}`)

  const title = unquote(parsed.fields.get('title'))
  if (!title) throw new Error(`title must not be empty in ${normalized}`)

  const dateField = kind === 'job' ? 'postedAt' : 'date'
  const date = unquote(parsed.fields.get(dateField))
  if (!isValidDate(date)) {
    throw new Error(`${dateField} must be a valid YYYY-MM-DD date in ${normalized}`)
  }

  if (kind === 'job') {
    if (!['ONSITE', 'HYBRID', 'REMOTE'].includes(unquote(parsed.fields.get('workingMode')))) {
      throw new Error(`Invalid workingMode in ${normalized}`)
    }
    if (
      !['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN'].includes(
        unquote(parsed.fields.get('employmentType'))
      )
    ) {
      throw new Error(`Invalid employmentType in ${normalized}`)
    }
    if (!['open', 'closed'].includes(unquote(parsed.fields.get('status')))) {
      throw new Error(`Invalid status in ${normalized}`)
    }
    if (!/^(mailto:|https:\/\/)/.test(unquote(parsed.fields.get('applyUrl')))) {
      throw new Error(`applyUrl must be a mailto: or https:// URL in ${normalized}`)
    }
  }

  assertUniqueSlug(root, normalized, parsed.fields)
  assertLocalAssetsExist(root, normalized, source)

  return {
    ok: true,
    kind,
    path: normalized,
    draft,
    title,
    date,
    bytes: Buffer.byteLength(source),
  }
}

export function validateContentTree({ root = process.cwd() } = {}) {
  const contentPaths = [
    ...listContentFiles(root, 'data/blog'),
    ...listContentFiles(root, 'data/jobs'),
  ].sort()
  const valid = []
  const privateInvalid = []
  const publicInvalid = []

  for (const selectedPath of contentPaths) {
    try {
      valid.push(validateContentFile({ root, selectedPath }))
    } catch (error) {
      const source = readFileSync(path.join(root, selectedPath), 'utf8')
      const draft = parseDraftValue(parseFrontmatter(source)?.fields.get('draft'))
      const issue = { path: selectedPath, error: error.message }
      if (draft === false) publicInvalid.push(issue)
      else privateInvalid.push(issue)
    }
  }

  return {
    ok: publicInvalid.length === 0,
    validCount: valid.length,
    privateInvalid,
    publicInvalid,
  }
}

function createBlogTemplate({ title }) {
  const now = new Date().toISOString().slice(0, 10)
  const safeTitle = title.replaceAll('"', '\\"')

  return `---
title: "${safeTitle}"
date: ${now}
tags: []
draft: true
summary: ""
---

`
}

function createJobTemplate({ title, applyUrl, team = 'Engineering', location = 'Seoul' }) {
  if (!applyUrl || !/^(mailto:|https:\/\/)/.test(applyUrl)) {
    throw new Error('Creating a job requires --apply-url with a mailto: or https:// URL')
  }

  const now = new Date().toISOString().slice(0, 10)
  const safeTitle = title.replaceAll('"', '\\"')
  const safeTeam = team.replaceAll('"', '\\"')
  const safeLocation = location.replaceAll('"', '\\"')

  return `---
title: "${safeTitle}"
summary: "${safeTitle} 채용 공고 초안"
team: "${safeTeam}"
location: "${safeLocation}"
workingMode: HYBRID
employmentType: FULL_TIME
experience: "협의"
status: open
draft: true
postedAt: ${now}
applyUrl: "${applyUrl}"
skills: ["작성 필요"]
responsibilities: ["작성 필요"]
qualifications: ["작성 필요"]
---

`
}

function runGit(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function tryGit(root, args) {
  try {
    return runGit(root, args)
  } catch {
    return null
  }
}

function parseDirtyPaths(statusOutput) {
  if (!statusOutput) return []

  return statusOutput
    .split('\0')
    .filter(Boolean)
    .map((entry) => entry.slice(3))
    .filter(Boolean)
    .map(toPosixPath)
}

function getGitState(root) {
  const head = tryGit(root, ['rev-parse', '--short=12', 'HEAD'])
  if (!head) {
    return {
      available: false,
      head: null,
      dirtyPaths: [],
      commitOrWorktree: 'git-unavailable',
    }
  }

  const dirtyPaths = parseDirtyPaths(tryGit(root, ['status', '--porcelain=v1', '-z']) ?? '')

  return {
    available: true,
    head,
    dirtyPaths,
    commitOrWorktree: dirtyPaths.length > 0 ? `worktree-dirty@${head}` : head,
  }
}

function assertNoUnrelatedDirtyFiles(root, selectedPath, { allowSelectedDirty = false } = {}) {
  const gitState = getGitState(root)
  if (!gitState.available) return gitState

  const dirtyPaths = new Set(gitState.dirtyPaths)
  const unrelatedDirtyPaths = [...dirtyPaths].filter((dirtyPath) => dirtyPath !== selectedPath)
  if (unrelatedDirtyPaths.length > 0) {
    throw new Error(
      `Refusing content workflow with unrelated dirty paths: ${unrelatedDirtyPaths.join(', ')}`
    )
  }

  if (!allowSelectedDirty && dirtyPaths.has(selectedPath)) {
    throw new Error(`Refusing to modify an already dirty selected file: ${selectedPath}`)
  }

  return gitState
}

function resolveAuditPath(root, auditPath) {
  if (path.isAbsolute(auditPath)) {
    throw new Error('Audit path must be repository-relative')
  }

  const normalizedAuditPath = toPosixPath(path.normalize(auditPath))
  if (
    normalizedAuditPath.startsWith('data/blog/') ||
    normalizedAuditPath.startsWith('data/jobs/')
  ) {
    throw new Error('Audit path must be outside content roots')
  }

  const rootPath = path.resolve(root)
  const absoluteAuditPath = path.resolve(root, normalizedAuditPath)
  if (!absoluteAuditPath.startsWith(`${rootPath}${path.sep}`)) {
    throw new Error('Audit path must stay inside the project root')
  }

  return absoluteAuditPath
}

function appendAudit({ root, auditPath, event, dryRun }) {
  const absoluteAuditPath = resolveAuditPath(root, auditPath)

  const auditEvent = {
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    actor:
      process.env.GIT_AUTHOR_NAME ||
      process.env.USER ||
      process.env.USERNAME ||
      process.env.LOGNAME ||
      'unknown',
    dryRun,
    ...event,
  }

  if (!dryRun) {
    mkdirSync(path.dirname(absoluteAuditPath), { recursive: true })
    appendFileSync(absoluteAuditPath, `${JSON.stringify(auditEvent)}\n`)
  }

  return auditEvent
}

export function createContentFile({
  root = process.cwd(),
  selectedPath,
  title,
  applyUrl,
  team,
  location,
  auditPath = DEFAULT_AUDIT_PATH,
  dryRun = false,
} = {}) {
  const { normalized, absolutePath } = resolveProjectPath(root, selectedPath)
  resolveAuditPath(root, auditPath)

  if (existsSync(absolutePath))
    throw new Error(`Refusing to overwrite existing file: ${normalized}`)

  const gitBefore = assertNoUnrelatedDirtyFiles(root, normalized, { allowSelectedDirty: false })
  const renderedTitle =
    title || path.basename(normalized, path.extname(normalized)).replaceAll('-', ' ')
  const kind = contentKind(normalized)
  const source =
    kind === 'job'
      ? createJobTemplate({ title: renderedTitle, applyUrl, team, location })
      : createBlogTemplate({ title: renderedTitle })

  if (!dryRun) {
    mkdirSync(path.dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, source)
    validateContentFile({ root, selectedPath: normalized })
  }

  const audit = appendAudit({
    root,
    auditPath,
    dryRun,
    event: {
      action: 'new',
      kind,
      path: normalized,
      commitOrWorktree: gitBefore.commitOrWorktree,
      outcome: dryRun ? 'dry-run' : 'created-draft',
    },
  })

  return {
    ok: true,
    action: 'new',
    kind,
    path: normalized,
    draft: true,
    dryRun,
    audit,
  }
}

function commitSelectedFile(root, selectedPath, commitMessage) {
  runGit(root, ['add', '--', selectedPath])
  const stagedPaths = runGit(root, ['diff', '--cached', '--name-only', '-z'])
    .split('\0')
    .filter(Boolean)
    .map(toPosixPath)
  if (stagedPaths.length !== 1 || stagedPaths[0] !== selectedPath) {
    throw new Error(`Refusing commit with unexpected staged paths: ${stagedPaths.join(', ')}`)
  }

  const message =
    commitMessage ||
    `Publish selected content through the reviewed Git workflow

Constraint: Only ${selectedPath} may be committed
Confidence: high
Scope-risk: narrow
Directive: Keep production immutable and deploy from Git
Tested: Selected content validation and staged-path boundary
Not-tested: Remote deployment is verified by the hosting pipeline`
  runGit(root, ['commit', '-m', message])
  return runGit(root, ['rev-parse', 'HEAD'])
}

function pushPublishedCommit(root, remote = 'origin', branch = 'main') {
  if (!/^[A-Za-z0-9._/-]+$/.test(remote) || !/^[A-Za-z0-9._/-]+$/.test(branch)) {
    throw new Error('Unsafe Git remote or branch')
  }
  runGit(root, ['push', remote, `HEAD:${branch}`])
}

export function publishContentFile({
  root = process.cwd(),
  selectedPath,
  auditPath = DEFAULT_AUDIT_PATH,
  dryRun = false,
  commit = false,
  push = false,
  remote = 'origin',
  branch = 'main',
  commitMessage,
} = {}) {
  const { normalized, absolutePath } = resolveProjectPath(root, selectedPath)
  resolveAuditPath(root, auditPath)

  const gitBefore = assertNoUnrelatedDirtyFiles(root, normalized, { allowSelectedDirty: false })
  const validation = validateContentFile({ root, selectedPath: normalized })
  const source = readFileSync(absolutePath, 'utf8')
  const updatedSource = source.replace(/^draft:\s*(true|false)\s*$/m, 'draft: false')
  const changed = source !== updatedSource

  if (validation.draft === false) {
    const audit = appendAudit({
      root,
      auditPath,
      dryRun,
      event: {
        action: 'publish',
        path: normalized,
        commitOrWorktree: gitBefore.commitOrWorktree,
        outcome: dryRun ? 'dry-run-already-published' : 'already-published',
      },
    })

    return { ok: true, action: 'publish', path: normalized, changed: false, dryRun, audit }
  }

  if (push && !commit) throw new Error('--push requires --commit')
  if (changed && !dryRun) {
    writeFileSync(absolutePath, updatedSource)
    validateContentFile({ root, selectedPath: normalized })
  }

  let committedSha = null
  if (changed && !dryRun && commit) {
    committedSha = commitSelectedFile(root, normalized, commitMessage)
    if (push) pushPublishedCommit(root, remote, branch)
  }

  const audit = appendAudit({
    root,
    auditPath,
    dryRun,
    event: {
      action: 'publish',
      path: normalized,
      commitOrWorktree: committedSha || gitBefore.commitOrWorktree,
      outcome: dryRun
        ? 'dry-run'
        : push
          ? 'published-and-pushed'
          : committedSha
            ? 'published-and-committed'
            : 'published',
    },
  })

  return {
    ok: true,
    action: 'publish',
    path: normalized,
    changed,
    dryRun,
    committedSha,
    pushed: Boolean(push && committedSha),
    audit,
  }
}

export function runContentWorkflow(argv = process.argv.slice(2)) {
  const command = argv[0]
  const options = parseOptions(argv.slice(1))

  if (command === 'check') {
    return options.path
      ? validateContentFile({ root: options.root, selectedPath: options.path })
      : validateContentTree({ root: options.root })
  }

  if (command === 'new') {
    return createContentFile({
      root: options.root,
      selectedPath: options.path,
      title: options.title,
      applyUrl: options.applyUrl,
      team: options.team,
      location: options.location,
      auditPath: options.auditPath,
      dryRun: options.dryRun,
    })
  }

  if (command === 'publish') {
    return publishContentFile({
      root: options.root,
      selectedPath: options.path,
      auditPath: options.auditPath,
      dryRun: options.dryRun,
      commit: options.commit,
      push: options.push,
      remote: options.remote,
      branch: options.branch,
      commitMessage: options.commitMessage,
    })
  }

  throw new Error(
    'Usage: content-workflow.mjs <check|new|publish> --path data/blog/.../*.mdx|data/jobs/*.mdx'
  )
}

function main() {
  try {
    const result = runContentWorkflow()
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    if (result.ok === false) process.exitCode = 1
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
