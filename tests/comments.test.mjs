import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  GISCUS_ORIGIN,
  getCommentThreadPath,
  resolveCommentProvider,
  validateCommentsConfig,
} from '../lib/comments/config.mjs'

const completeConfig = {
  provider: 'giscus',
  giscusConfig: {
    repo: 'company/engineering',
    repositoryId: 'R_kgDOExample',
    category: 'Comments',
    categoryId: 'DIC_kwDOExample',
    mapping: 'pathname',
    reactions: '1',
    metadata: '0',
    theme: 'light',
    darkTheme: 'transparent_dark',
    lang: 'ko',
  },
}

describe('comment provider boundary', () => {
  it('keeps comments absent when globally unset or completely unconfigured', () => {
    assert.deepEqual(validateCommentsConfig(undefined), {
      ok: true,
      enabled: false,
      reason: 'provider-unset',
    })
    assert.equal(validateCommentsConfig({ provider: 'giscus', giscusConfig: {} }).enabled, false)
  })

  it('rejects partial Giscus configuration and non-pathname mapping', () => {
    const partial = validateCommentsConfig({
      provider: 'giscus',
      giscusConfig: { repo: 'company/engineering' },
    })
    const unstable = validateCommentsConfig({
      ...completeConfig,
      giscusConfig: { ...completeConfig.giscusConfig, mapping: 'title' },
    })

    assert.equal(partial.ok, false)
    assert.deepEqual(partial.missing, ['repositoryId', 'category', 'categoryId'])
    assert.equal(unstable.reason, 'giscus-mapping-must-be-pathname')
  })

  it('uses a stable blog pathname and honors per-post disablement', () => {
    assert.equal(getCommentThreadPath('frontend/rendering'), '/blog/frontend/rendering')
    const enabled = resolveCommentProvider({
      commentsConfig: completeConfig,
      slug: 'frontend/rendering',
    })
    const disabled = resolveCommentProvider({
      commentsConfig: completeConfig,
      slug: 'frontend/rendering',
      enabled: false,
    })

    assert.equal(enabled.enabled, true)
    assert.equal(enabled.giscusConfig.mapping, 'pathname')
    assert.equal(enabled.threadPath, '/blog/frontend/rendering')
    assert.equal(disabled.enabled, false)
    assert.equal(disabled.reason, 'disabled-by-post')
  })

  it('lazy-loads the provider and keeps the CSP Giscus-only boundary explicit', () => {
    const component = readFileSync('components/Comments.tsx', 'utf8')
    const nextConfig = readFileSync('next.config.js', 'utf8')

    assert.match(component, /IntersectionObserver/)
    assert.match(component, /dynamic\(/)
    assert.match(nextConfig, /script-src[^;]*giscus\.app/)
    assert.match(nextConfig, /frame-src[^;]*giscus\.app/)
    assert.equal(GISCUS_ORIGIN, 'https://giscus.app')
  })
})
