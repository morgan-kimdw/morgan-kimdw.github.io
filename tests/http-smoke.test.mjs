import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { matchRawContent } from '../scripts/http-smoke.mjs'

describe('HTTP snapshot extraction', () => {
  it('preserves the matched HTML fragment without partial decoding or sanitization', () => {
    const html = '<h1>Signal &amp; Noise<br>실행</h1>'

    assert.equal(matchRawContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i), 'Signal &amp; Noise<br>실행')
  })

  it('returns null when the requested field is absent', () => {
    assert.equal(matchRawContent('<main>content</main>', /<title>(.*?)<\/title>/i), null)
  })
})
