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

  if (typeof candidate.date === 'string' && isDateOnly(candidate.date)) {
    const publicationDay = parseDateOnly(candidate.date)
    return publicationDay !== null && publicationDay <= getKstDateValue(now)
  }

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

/**
 * @param {string} value
 */
function isDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/**
 * @param {string} value
 * @returns {number | null}
 */
function parseDateOnly(value) {
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }

  return year * 10000 + month * 100 + day
}

/**
 * @param {Date} date
 */
function getKstDateValue(date) {
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return kstDate.getUTCFullYear() * 10000 + (kstDate.getUTCMonth() + 1) * 100 + kstDate.getUTCDate()
}
