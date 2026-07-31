import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getPaginationBasePath } from '../lib/pagination.mjs'

describe('pagination base path', () => {
  it('normalizes list routes with and without a trailing slash', () => {
    assert.equal(getPaginationBasePath('/blog/page/2'), 'blog')
    assert.equal(getPaginationBasePath('/blog/page/2/'), 'blog')
    assert.equal(getPaginationBasePath('/tags/frontend/page/3'), 'tags/frontend')
    assert.equal(getPaginationBasePath('/tags/frontend/page/3/'), 'tags/frontend')
  })

  it('keeps unpaginated list routes stable', () => {
    assert.equal(getPaginationBasePath('/blog'), 'blog')
    assert.equal(getPaginationBasePath('/blog/'), 'blog')
    assert.equal(getPaginationBasePath('/tags/frontend/'), 'tags/frontend')
  })
})
