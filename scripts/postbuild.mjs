import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

import rss from './rss.mjs'

async function bundleStandaloneAssets() {
  if (process.env.EXPORT) return

  const standaloneRoot = path.join('.next', 'standalone')
  const standaloneStatic = path.join(standaloneRoot, '.next', 'static')
  const standalonePublic = path.join(standaloneRoot, 'public')

  await rm(standaloneStatic, { force: true, recursive: true })
  await rm(standalonePublic, { force: true, recursive: true })
  await mkdir(path.dirname(standaloneStatic), { recursive: true })
  await cp(path.join('.next', 'static'), standaloneStatic, { recursive: true })
  await cp('public', standalonePublic, { recursive: true })
}

async function postbuild() {
  await rss()
  await bundleStandaloneAssets()
}

postbuild()
