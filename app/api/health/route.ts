import packageJson from '@/package.json'

// Static generation keeps the emergency EXPORT=1 deployment viable. Container
// builds bake the immutable release SHA before this response is generated.
export const dynamic = 'force-static'
export const runtime = 'nodejs'

const service = 'moel-engineering'
const release = process.env.RELEASE_SHA || process.env.NEXT_PUBLIC_RELEASE_SHA || 'development'

export function GET() {
  return Response.json(
    {
      status: 'ok',
      service,
      version: packageJson.version,
      release,
      runtime: 'node',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}
