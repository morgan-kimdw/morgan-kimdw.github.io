import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { buildBaselineSnapshot } from '../scripts/baseline-snapshot.mjs'

const fixture = JSON.parse(readFileSync('tests/fixtures/site-baseline.json', 'utf8'))

describe('site baseline snapshot', () => {
  it('captures route, metadata, dependency, runtime, generated artifact, and performance baselines', () => {
    const snapshot = buildBaselineSnapshot()

    assert.equal(snapshot.content.counts.totalFiles, fixture.content.counts.totalFiles)
    assert.equal(snapshot.content.counts.mdxFiles, fixture.content.counts.mdxFiles)
    assert.equal(
      snapshot.content.counts.explicitDraftTrue,
      fixture.content.counts.explicitDraftTrue
    )
    assert.equal(snapshot.content.counts.mdxDraftFalse, fixture.content.counts.mdxDraftFalse)
    assert.deepEqual(snapshot.content.untrackedPaths, fixture.content.untrackedPaths)
    assert.deepEqual(snapshot.content.missingDraftPaths, fixture.content.missingDraftPaths)

    for (const baselineRoute of fixture.routes.appRoutes) {
      assert.ok(
        snapshot.routes.appRoutes.some(
          (currentRoute) =>
            currentRoute.route === baselineRoute.route &&
            currentRoute.filePath === baselineRoute.filePath
        )
      )
    }

    assert.equal(snapshot.metadata.commentsProvider, 'giscus')
    assert.equal(snapshot.metadata.searchProvider, 'kbar')

    assert.equal(typeof snapshot.packageJson.packageManager, 'string')
    assert.equal(typeof snapshot.runtime.node, 'string')
    assert.equal(typeof snapshot.runtime.yarn, 'string')
    assert.ok(snapshot.generatedArtifacts.feedFiles.length >= 1)
    assert.equal(
      snapshot.generatedArtifacts.searchJson.documents,
      snapshot.content.counts.publishedMdx
    )
    assert.ok(snapshot.performanceArtifacts.publicAssetBytes > 0)
  })

  it('records custom MDX compatibility anchors', () => {
    const snapshot = buildBaselineSnapshot()

    assert.equal(snapshot.content.customMdxUsage.Youtube.componentPath, 'components/Youtube.tsx')
    assert.ok(snapshot.content.customMdxUsage.Youtube.usagePaths.length >= 1)
    assert.ok(snapshot.content.customMdxUsage.TOCInline.usagePaths.length >= 1)
  })
})
