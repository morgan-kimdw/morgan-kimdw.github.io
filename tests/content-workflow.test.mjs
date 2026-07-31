import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, it } from 'node:test'

import {
  createContentFile,
  publishContentFile,
  validateContentFile,
  validateContentTree,
} from '../scripts/content-workflow.mjs'

const tempRoots = []

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

async function makeRepo() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'content-workflow-'))
  tempRoots.push(root)
  await mkdir(path.join(root, 'data/blog/team'), { recursive: true })
  git(root, ['init'])
  git(root, ['config', 'user.name', 'Content Bot'])
  git(root, ['config', 'user.email', 'content@example.com'])
  return root
}

function writePost(root, relativePath, { draft = true } = {}) {
  const absolutePath = path.join(root, relativePath)
  writeFileSync(
    absolutePath,
    `---
title: "Hiring Notes"
date: 2026-07-31
tags: []
draft: ${draft ? 'true' : 'false'}
summary: ""
---

Body text stays untouched.
`
  )
}

function commitAll(root) {
  git(root, ['add', '.'])
  git(root, ['commit', '-m', 'fixture'])
}

function makeBareRemote() {
  const remoteRoot = mkdtempSync(path.join(os.tmpdir(), 'content-workflow-remote-'))
  tempRoots.push(remoteRoot)
  const remotePath = path.join(remoteRoot, 'origin.git')
  git(remoteRoot, ['init', '--bare', remotePath])
  return remotePath
}

function remoteBranchHead(remotePath, branch = 'main') {
  return git(remotePath, ['rev-parse', branch])
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('content publishing workflow', () => {
  it('validates exactly one selected data/blog MDX file', async () => {
    const root = await makeRepo()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)

    const result = validateContentFile({
      root,
      selectedPath: 'data/blog/team/hiring-notes.mdx',
    })

    assert.equal(result.ok, true)
    assert.equal(result.path, 'data/blog/team/hiring-notes.mdx')
    assert.equal(result.draft, true)
    assert.equal(result.title, 'Hiring Notes')
    assert.throws(
      () => validateContentFile({ root, selectedPath: 'data/blog/team/hiring-notes.md' }),
      /Unsafe content path/
    )
  })

  it('rejects invalid dates, duplicate or unsafe slugs, and broken local assets', async () => {
    const root = await makeRepo()
    writeFileSync(
      path.join(root, 'data/blog/team/first.mdx'),
      `---
title: "First"
date: 2026-07-31
draft: true
slug: shared
---
`
    )
    writeFileSync(
      path.join(root, 'data/blog/team/second.mdx'),
      `---
title: "Second"
date: 2026-02-31
draft: true
slug: shared
---

![Missing](/static/images/missing.png)
`
    )

    assert.throws(
      () => validateContentFile({ root, selectedPath: 'data/blog/team/second.mdx' }),
      /valid YYYY-MM-DD date/
    )

    writeFileSync(
      path.join(root, 'data/blog/team/second.mdx'),
      `---
title: "Second"
date: 2026-07-31
draft: true
slug: shared
---
`
    )
    assert.throws(
      () => validateContentFile({ root, selectedPath: 'data/blog/team/second.mdx' }),
      /Duplicate slug/
    )

    writeFileSync(
      path.join(root, 'data/blog/team/second.mdx'),
      `---
title: "Second"
date: 2026-07-31
draft: true
slug: ../unsafe
---
`
    )
    assert.throws(
      () => validateContentFile({ root, selectedPath: 'data/blog/team/second.mdx' }),
      /Invalid slug/
    )

    writeFileSync(
      path.join(root, 'data/blog/team/second.mdx'),
      `---
title: "Second"
date: 2026-07-31
draft: true
---

![Missing](/static/images/missing.png)
`
    )
    assert.throws(
      () => validateContentFile({ root, selectedPath: 'data/blog/team/second.mdx' }),
      /Broken local asset reference/
    )
  })

  it('reports invalid private content but blocks invalid public content in a tree scan', async () => {
    const root = await makeRepo()
    writeFileSync(path.join(root, 'data/blog/team/private-invalid.mdx'), 'Private notes\n')

    const privateResult = validateContentTree({ root })
    assert.equal(privateResult.ok, true)
    assert.equal(privateResult.privateInvalid.length, 1)
    assert.equal(privateResult.publicInvalid.length, 0)

    writeFileSync(
      path.join(root, 'data/blog/team/public-invalid.mdx'),
      `---
title: "Public but invalid"
date: invalid
draft: false
---
`
    )
    const publicResult = validateContentTree({ root })
    assert.equal(publicResult.ok, false)
    assert.equal(publicResult.publicInvalid.length, 1)
  })

  it('creates only the requested safe draft path and writes metadata-only audit', async () => {
    const root = await makeRepo()
    const result = createContentFile({
      root,
      selectedPath: 'data/blog/team/new-role.mdx',
      title: 'New Role',
      auditPath: '.omx/audit/test-publishing.jsonl',
    })
    const source = readFileSync(path.join(root, 'data/blog/team/new-role.mdx'), 'utf8')
    const audit = readFileSync(path.join(root, '.omx/audit/test-publishing.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))

    assert.equal(result.ok, true)
    assert.match(source, /title: "New Role"/)
    assert.match(source, /draft: true/)
    assert.equal(audit.length, 1)
    assert.equal(audit[0].path, 'data/blog/team/new-role.mdx')
    assert.equal(audit[0].outcome, 'created-draft')
    assert.equal(audit[0].body, undefined)
    assert.equal(audit[0].content, undefined)
  })

  it('creates a schema-valid draft job only when an external application URL is supplied', async () => {
    const root = await makeRepo()
    const selectedPath = 'data/jobs/platform-engineer.mdx'

    assert.throws(
      () => createContentFile({ root, selectedPath, title: 'Platform Engineer' }),
      /requires --apply-url/
    )

    const result = createContentFile({
      root,
      selectedPath,
      title: 'Platform Engineer',
      applyUrl: 'https://jobs.example.com/platform-engineer',
      team: 'Platform',
      location: 'Seoul',
      auditPath: '.omx/audit/test-publishing.jsonl',
    })
    const validation = validateContentFile({ root, selectedPath })

    assert.equal(result.kind, 'job')
    assert.equal(validation.kind, 'job')
    assert.equal(validation.draft, true)
  })

  it('publishes by changing only the selected draft flag', async () => {
    const root = await makeRepo()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)

    const before = readFileSync(path.join(root, 'data/blog/team/hiring-notes.mdx'), 'utf8')
    const result = publishContentFile({
      root,
      selectedPath: 'data/blog/team/hiring-notes.mdx',
      auditPath: '.omx/audit/test-publishing.jsonl',
    })
    const after = readFileSync(path.join(root, 'data/blog/team/hiring-notes.mdx'), 'utf8')
    const changedLines = git(root, ['diff', '--', 'data/blog/team/hiring-notes.mdx'])
    const audit = readFileSync(path.join(root, '.omx/audit/test-publishing.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))

    assert.equal(result.changed, true)
    assert.equal(after, before.replace('draft: true', 'draft: false'))
    assert.match(changedLines, /-draft: true/)
    assert.match(changedLines, /\+draft: false/)
    assert.doesNotMatch(changedLines, /Body text stays untouched\./)
    assert.equal(audit[0].action, 'publish')
    assert.equal(audit[0].path, 'data/blog/team/hiring-notes.mdx')
    assert.equal(audit[0].outcome, 'published')
    assert.match(audit[0].commitOrWorktree, /^[0-9a-f]{12}$/)
  })

  it('optionally commits only the selected published file with an auditable SHA', async () => {
    const root = await makeRepo()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)

    const result = publishContentFile({
      root,
      selectedPath: 'data/blog/team/hiring-notes.mdx',
      auditPath: '.omx/audit/test-publishing.jsonl',
      commit: true,
    })
    const committedPaths = git(root, ['show', '--pretty=format:', '--name-only', 'HEAD'])
      .split('\n')
      .filter(Boolean)

    assert.match(result.committedSha, /^[0-9a-f]{40}$/)
    assert.deepEqual(committedPaths, ['data/blog/team/hiring-notes.mdx'])
    assert.equal(result.audit.commitOrWorktree, result.committedSha)
    assert.equal(result.audit.outcome, 'published-and-committed')
  })

  it('rejects --push from a feature branch without changing the target remote', async () => {
    const root = await makeRepo()
    const remotePath = makeBareRemote()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)
    git(root, ['branch', '-M', 'main'])
    git(root, ['remote', 'add', 'origin', remotePath])
    git(root, ['push', '-u', 'origin', 'main'])
    const remoteBefore = remoteBranchHead(remotePath)

    git(root, ['checkout', '-b', 'feature/publishing'])
    writeFileSync(path.join(root, 'README.md'), 'feature branch work\n')
    commitAll(root)
    const localHeadBefore = git(root, ['rev-parse', 'HEAD'])
    const sourceBefore = readFileSync(path.join(root, 'data/blog/team/hiring-notes.mdx'), 'utf8')
    const auditPath = path.join(root, '.omx/audit/test-publishing.jsonl')

    assert.throws(
      () =>
        publishContentFile({
          root,
          selectedPath: 'data/blog/team/hiring-notes.mdx',
          auditPath: '.omx/audit/test-publishing.jsonl',
          commit: true,
          push: true,
          remote: 'origin',
          branch: 'main',
        }),
      /Refusing to push publication from branch feature\/publishing to main/
    )
    assert.equal(remoteBranchHead(remotePath), remoteBefore)
    assert.equal(git(root, ['rev-parse', 'HEAD']), localHeadBefore)
    assert.equal(
      readFileSync(path.join(root, 'data/blog/team/hiring-notes.mdx'), 'utf8'),
      sourceBefore
    )
    assert.equal(existsSync(auditPath), false)
  })

  it('pushes a single publication commit from the target branch', async () => {
    const root = await makeRepo()
    const remotePath = makeBareRemote()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)
    git(root, ['branch', '-M', 'main'])
    git(root, ['remote', 'add', 'origin', remotePath])
    git(root, ['push', '-u', 'origin', 'main'])
    const remoteBefore = remoteBranchHead(remotePath)

    const result = publishContentFile({
      root,
      selectedPath: 'data/blog/team/hiring-notes.mdx',
      auditPath: '.omx/audit/test-publishing.jsonl',
      commit: true,
      push: true,
      remote: 'origin',
      branch: 'main',
    })

    assert.equal(result.pushed, true)
    assert.equal(remoteBranchHead(remotePath), result.committedSha)
    assert.equal(git(root, ['rev-parse', `${result.committedSha}^1`]), remoteBefore)
    assert.equal(result.audit.outcome, 'published-and-pushed')
  })

  it('dry-runs without modifying content or audit files', async () => {
    const root = await makeRepo()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)
    const contentPath = path.join(root, 'data/blog/team/hiring-notes.mdx')
    const before = readFileSync(contentPath, 'utf8')

    const result = publishContentFile({
      root,
      selectedPath: 'data/blog/team/hiring-notes.mdx',
      auditPath: '.omx/audit/test-publishing.jsonl',
      dryRun: true,
    })

    assert.equal(result.dryRun, true)
    assert.equal(readFileSync(contentPath, 'utf8'), before)
    assert.throws(() => readFileSync(path.join(root, '.omx/audit/test-publishing.jsonl'), 'utf8'), {
      code: 'ENOENT',
    })
  })

  it('rejects publishing when unrelated dirty paths make the selected change ambiguous', async () => {
    const root = await makeRepo()
    writePost(root, 'data/blog/team/hiring-notes.mdx')
    commitAll(root)
    writeFileSync(path.join(root, 'README.md'), 'unrelated edit\n')

    assert.throws(
      () =>
        publishContentFile({
          root,
          selectedPath: 'data/blog/team/hiring-notes.mdx',
          auditPath: '.omx/audit/test-publishing.jsonl',
        }),
      /unrelated dirty paths/
    )
  })

  it('keeps audit metadata outside data/blog and inside the project root', async () => {
    const root = await makeRepo()

    assert.throws(
      () =>
        createContentFile({
          root,
          selectedPath: 'data/blog/team/new-role.mdx',
          auditPath: 'data/blog/audit.jsonl',
        }),
      /outside content roots/
    )
    assert.throws(() => readFileSync(path.join(root, 'data/blog/team/new-role.mdx'), 'utf8'), {
      code: 'ENOENT',
    })

    assert.throws(
      () =>
        createContentFile({
          root,
          selectedPath: 'data/blog/team/another-role.mdx',
          auditPath: '../audit.jsonl',
        }),
      /inside the project root/
    )
    assert.throws(() => readFileSync(path.join(root, 'data/blog/team/another-role.mdx'), 'utf8'), {
      code: 'ENOENT',
    })
  })
})
