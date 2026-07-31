export const GISCUS_ORIGIN = 'https://giscus.app'

const REQUIRED_GISCUS_FIELDS = ['repo', 'repositoryId', 'category', 'categoryId']

export function getCommentThreadPath(slug) {
  const normalizedSlug = String(slug || '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')

  return normalizedSlug ? `/blog/${normalizedSlug}` : null
}

export function validateCommentsConfig(commentsConfig) {
  if (!commentsConfig?.provider) {
    return { ok: true, enabled: false, reason: 'provider-unset' }
  }
  if (commentsConfig.provider !== 'giscus') {
    return {
      ok: false,
      enabled: false,
      reason: `unsupported-provider:${commentsConfig.provider}`,
    }
  }

  const giscusConfig = commentsConfig.giscusConfig ?? {}
  const missing = REQUIRED_GISCUS_FIELDS.filter((field) => !giscusConfig[field])
  if (missing.length === REQUIRED_GISCUS_FIELDS.length) {
    return { ok: true, enabled: false, reason: 'giscus-unconfigured' }
  }
  if (missing.length > 0) {
    return {
      ok: false,
      enabled: false,
      reason: 'giscus-incomplete',
      missing,
    }
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(giscusConfig.repo)) {
    return { ok: false, enabled: false, reason: 'giscus-invalid-repo' }
  }
  if (giscusConfig.mapping && giscusConfig.mapping !== 'pathname') {
    return { ok: false, enabled: false, reason: 'giscus-mapping-must-be-pathname' }
  }

  return {
    ok: true,
    enabled: true,
    provider: 'giscus',
    giscusConfig: {
      ...giscusConfig,
      mapping: 'pathname',
    },
  }
}

export function resolveCommentProvider({ commentsConfig, slug, enabled = true }) {
  const threadPath = getCommentThreadPath(slug)
  if (!enabled) return { ok: true, enabled: false, reason: 'disabled-by-post', threadPath }
  if (!threadPath) return { ok: false, enabled: false, reason: 'invalid-thread-path' }

  return {
    ...validateCommentsConfig(commentsConfig),
    threadPath,
  }
}

export function isCommentsAvailable(commentsConfig, enabled = true) {
  return enabled && validateCommentsConfig(commentsConfig).enabled
}
