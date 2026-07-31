import type { Instrumentation } from 'next'

const service = 'aegifold-technologies'

function releaseIdentity() {
  return process.env.RELEASE_SHA || process.env.NEXT_PUBLIC_RELEASE_SHA || 'development'
}

function emit(level: 'info' | 'error', event: string, details: Record<string, unknown> = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    service,
    release: releaseIdentity(),
    ...details,
  })

  if (level === 'error') {
    console.error(entry)
    return
  }

  console.info(entry)
}

export function register() {
  emit('info', 'app.start', {
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
  })
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const safeError =
    error instanceof Error
      ? {
          name: error.name,
          digest: 'digest' in error ? String(error.digest) : undefined,
        }
      : { name: 'UnknownError' }

  emit('error', 'request.error', {
    method: request.method,
    path: request.path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    error: safeError,
  })
}
