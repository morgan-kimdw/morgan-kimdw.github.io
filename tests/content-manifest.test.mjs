import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildManifest, compareBaseline, loadBaseline } from '../scripts/content-manifest.mjs'

describe('content manifest baseline', () => {
  it('matches the protected data/blog inventory captured in the baseline', () => {
    const manifest = buildManifest({ includeUntracked: false })
    const baseline = loadBaseline()

    assert.deepEqual(manifest.counts, baseline.counts)
    assert.equal(
      manifest.counts.mdxFiles + manifest.counts.markdownFiles,
      manifest.counts.totalFiles
    )
    assert.equal(
      manifest.counts.mdxDraftTrue +
        manifest.counts.mdxDraftFalse +
        manifest.counts.mdxMissingDraft,
      manifest.counts.mdxFiles
    )
  })

  it('keeps the committed baseline portable while reporting local untracked content', () => {
    const repositoryManifest = buildManifest({ includeUntracked: false })
    const localManifest = buildManifest()

    assert.deepEqual(repositoryManifest.untrackedPaths, [])
    assert.equal(repositoryManifest.counts.gitUntracked, 0)
    assert.ok(localManifest.untrackedPaths.every((filePath) => filePath.startsWith('data/blog/')))
    assert.equal(
      localManifest.counts.totalFiles,
      repositoryManifest.counts.totalFiles + localManifest.counts.gitUntracked
    )
  })

  it('reports missing explicit draft flags separately from explicit published posts', () => {
    const manifest = buildManifest({ includeUntracked: false })
    const baseline = loadBaseline()
    const missingDraftPaths = manifest.files
      .filter((file) => file.draft === null)
      .map((file) => file.path)

    assert.equal(manifest.counts.missingDraftField, missingDraftPaths.length)
    assert.deepEqual(
      missingDraftPaths,
      baseline.files.filter((file) => file.draft === null).map((file) => file.path)
    )
    assert.equal(manifest.counts.publishedMdx, manifest.counts.mdxDraftFalse)
  })

  it('detects drift from the checked-in baseline', () => {
    const result = compareBaseline()

    assert.equal(result.ok, true)
    assert.deepEqual(result.changedFiles, [])
    assert.deepEqual(result.missingFiles, [])
    assert.deepEqual(result.addedFiles, [])
    assert.deepEqual(result.countMismatches, [])
  })
})
