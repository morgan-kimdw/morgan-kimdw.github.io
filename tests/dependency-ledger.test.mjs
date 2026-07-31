import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildDependencyLedger } from '../scripts/dependency-ledger.mjs'

const registryFixture = {
  eslint: {
    current: '9.39.5',
    wanted: '9.39.5',
    latest: '10.8.0',
  },
  typescript: {
    current: '6.0.3',
    wanted: '6.0.3',
    latest: '7.0.2',
  },
}

describe('dependency ledger', () => {
  it('covers every direct dependency and devDependency', () => {
    const ledger = buildDependencyLedger({ outdated: registryFixture })

    assert.equal(ledger.counts.total, ledger.counts.dependencies + ledger.counts.devDependencies)
    assert.equal(
      ledger.counts.total,
      ledger.entries.filter((entry) => entry.section === 'dependencies').length +
        ledger.entries.filter((entry) => entry.section === 'devDependencies').length
    )
    assert.ok(
      ledger.entries.every((entry) => entry.owner === 'G002-runtime-and-dependency-modernization')
    )
    assert.ok(ledger.entries.every((entry) => entry.target))
    assert.ok(ledger.entries.every((entry) => entry.decision))
  })

  it('documents the critical compatibility hold and removed direct dependencies', () => {
    const ledger = buildDependencyLedger({ outdated: registryFixture })
    const byName = new Map(ledger.entries.map((entry) => [entry.name, entry]))
    const removed = new Set(ledger.removedDirectDependencies.map((entry) => entry.name))

    assert.equal(byName.get('typescript').decision, 'hold')
    assert.equal(byName.get('typescript').target, '6.0.3')
    assert.equal(byName.get('eslint').decision, 'hold')
    assert.equal(byName.get('eslint').target, '9.39.5')
    assert.equal(ledger.nodeTarget.version, '24.18.0')
    assert.deepEqual([...removed].sort(), [
      'body-scroll-lock',
      'gh-pages',
      'gray-matter',
      'image-size',
      'remark',
      'unist-util-visit',
    ])
    assert.equal(byName.has('body-scroll-lock'), false)
    assert.ok(ledger.securityResolutions.every((entry) => entry.configured))
    assert.ok(
      ledger.acceptedTransitiveRisks.some((entry) =>
        entry.packages.includes('@opentelemetry/propagator-jaeger@1.30.1')
      )
    )
    assert.ok(
      ledger.acceptedTransitiveRisks.every(
        (entry) => entry.owner && entry.reviewAfter && entry.exposure && entry.decision
      )
    )
  })
})
