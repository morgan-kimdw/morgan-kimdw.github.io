/**
 * The one public-visibility policy for blog documents.
 *
 * A post is public only when it opts in with `draft: false`, has the minimum
 * generated identity fields, and its publication date is valid and not in the
 * future. Missing draft state is deliberately private.
 *
 * @param {unknown} post
 * @param {Date} [now]
 */
export function isPublishedPost(post, now = new Date()) {
  if (!post || typeof post !== 'object') return false

  const candidate =
    /** @type {{ draft?: unknown, date?: unknown, slug?: unknown, title?: unknown }} */ (post)
  if (candidate.draft !== false) return false
  if (typeof candidate.slug !== 'string' || candidate.slug.trim() === '') return false
  if (typeof candidate.title !== 'string' || candidate.title.trim() === '') return false

  const publishedAt = new Date(/** @type {string | number | Date} */ (candidate.date))
  return !Number.isNaN(publishedAt.getTime()) && publishedAt.getTime() <= now.getTime()
}

/**
 * @template T
 * @param {readonly T[]} posts
 * @param {Date} [now]
 * @returns {T[]}
 */
export function getPublishedPosts(posts, now = new Date()) {
  return posts.filter((post) => isPublishedPost(post, now))
}
