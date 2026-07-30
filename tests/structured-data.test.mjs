import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { getPublishedPosts } from '../lib/content/public-content.mjs'

const generatedBlogs = JSON.parse(readFileSync('.contentlayer/generated/Blog/_index.json', 'utf8'))
const generatedJobs = JSON.parse(readFileSync('.contentlayer/generated/Job/_index.json', 'utf8'))

describe('public structured data', () => {
  it('provides BlogPosting metadata for publishable articles', () => {
    const publicBlogs = getPublishedPosts(generatedBlogs)

    assert.ok(publicBlogs.length > 0)
    assert.ok(publicBlogs.every((post) => post.structuredData['@type'] === 'BlogPosting'))
    assert.ok(publicBlogs.every((post) => post.structuredData.headline === post.title))
    assert.ok(publicBlogs.every((post) => post.structuredData.url.includes(`/${post.path}`)))
  })

  it('provides JobPosting metadata and external applications for public roles', () => {
    const publicJobs = generatedJobs.filter((job) => job.isPublic)

    assert.ok(publicJobs.length > 0)
    assert.ok(publicJobs.every((job) => job.structuredData['@type'] === 'JobPosting'))
    assert.ok(publicJobs.every((job) => /^https:\/\/|^mailto:/.test(job.applyUrl)))
    assert.ok(publicJobs.every((job) => job.structuredData.directApply === false))
  })

  it('keeps the main landmark and keyboard skip target explicit', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8')

    assert.match(layout, /href="#main-content"/)
    assert.match(layout, /<main id="main-content"/)
  })
})
