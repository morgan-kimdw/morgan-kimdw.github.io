import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { slug } from 'github-slugger'

import { getPublishedPosts, isPublishedPost } from '../lib/content/public-content.mjs'

const now = new Date('2026-07-30T00:00:00.000Z')

function post(overrides = {}) {
  return {
    title: 'Visible article',
    slug: 'visible-article',
    date: '2026-07-29T00:00:00.000Z',
    draft: false,
    ...overrides,
  }
}

describe('public content selector', () => {
  it('publishes only explicit, valid, non-future articles', () => {
    const published = post()
    const candidates = [
      published,
      post({ slug: 'draft', draft: true }),
      post({ slug: 'missing-draft', draft: undefined }),
      post({ slug: 'future', date: '2026-07-31T00:00:00.000Z' }),
      post({ slug: 'invalid-date', date: 'not-a-date' }),
      post({ slug: '', title: 'Missing slug' }),
      post({ slug: 'missing-title', title: '' }),
      null,
    ]

    assert.equal(isPublishedPost(published, now), true)
    assert.deepEqual(getPublishedPosts(candidates, now), [published])
  })

  it('matches generated search and RSS membership', () => {
    const generatedBlogs = JSON.parse(
      readFileSync('.contentlayer/generated/Blog/_index.json', 'utf8')
    )
    const expectedSlugs = getPublishedPosts(generatedBlogs)
      .map(({ slug }) => slug)
      .sort()
    const searchSlugs = JSON.parse(readFileSync('public/search.json', 'utf8'))
      .map(({ slug }) => slug)
      .sort()
    const feed = readFileSync('public/feed.xml', 'utf8')
    const feedSlugs = [...feed.matchAll(/<guid>[^<]+\/blog\/([^<]+)<\/guid>/g)]
      .map((match) => match[1])
      .sort()

    assert.equal(expectedSlugs.length, 27)
    assert.deepEqual(searchSlugs, expectedSlugs)
    assert.deepEqual(feedSlugs, expectedSlugs)
  })

  it('derives tag counts and sitemap URLs from the same membership', () => {
    const generatedBlogs = JSON.parse(
      readFileSync('.contentlayer/generated/Blog/_index.json', 'utf8')
    )
    const publishedPosts = getPublishedPosts(generatedBlogs)
    const expectedTagCounts = {}
    for (const post of publishedPosts) {
      for (const tag of post.tags ?? []) {
        const tagSlug = slug(tag)
        expectedTagCounts[tagSlug] = (expectedTagCounts[tagSlug] ?? 0) + 1
      }
    }

    const tagCounts = JSON.parse(readFileSync('app/tag-data.json', 'utf8'))
    const sitemap = readFileSync('.next/server/app/sitemap.xml.body', 'utf8')
    const sitemapBlogUrls = [...sitemap.matchAll(/<loc>([^<]+\/blog\/[^<]+)<\/loc>/g)]
      .map((match) => match[1])
      .sort()
    const expectedBlogUrls = publishedPosts
      .map(({ path }) => `https://morgan-kimdw.github.io/${path}`)
      .sort()

    assert.deepEqual(tagCounts, expectedTagCounts)
    assert.deepEqual(sitemapBlogUrls, expectedBlogUrls)
  })
})
