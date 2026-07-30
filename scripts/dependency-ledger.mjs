import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export const LEDGER_PATH = '.omx/evidence/G002/dependency-ledger.json'

export const REMOVED_DIRECT_DEPENDENCIES = [
  {
    name: 'body-scroll-lock',
    decision: 'removed',
    rationale:
      'Replaced the stale beta package with the scroll locking built into the Headless UI Dialog.',
  },
  {
    name: 'gh-pages',
    decision: 'removed',
    rationale: 'Unused because GitHub Pages deployment is handled by the Actions workflow.',
  },
  {
    name: 'gray-matter',
    decision: 'removed',
    rationale: 'No direct import; Contentlayer2 owns the transitive parser dependency.',
  },
  {
    name: 'image-size',
    decision: 'removed',
    rationale: 'No direct import or runtime call remains in the repository.',
  },
  {
    name: 'remark',
    decision: 'removed',
    rationale: 'No direct import; Pliny owns the transitive unified processor dependency.',
  },
  {
    name: 'unist-util-visit',
    decision: 'removed',
    rationale: 'No direct import; Pliny owns the transitive utility dependency.',
  },
]

export const SECURITY_RESOLUTION_DECISIONS = [
  {
    descriptor: 'js-yaml@npm:4.1.0',
    target: 'npm:4.3.0',
    rationale: 'Same-major security update for the exact Pliny dependency.',
  },
  {
    descriptor: 'postcss@npm:8.4.31',
    target: 'npm:8.5.25',
    rationale: 'Same-major security update for the exact Next.js dependency.',
  },
  {
    descriptor: 'sharp@npm:^0.34.5',
    target: 'npm:0.35.3',
    rationale: 'Security update verified through the production image/build path.',
  },
  {
    descriptor: 'socks@npm:^2.8.3',
    target: 'npm:2.8.9',
    rationale: 'Same-major proxy client update that selects a fixed ip-address release.',
  },
  {
    descriptor: 'superagent@npm:3.8.1',
    target: 'npm:10.3.0',
    rationale:
      'Security update for Pliny’s unused Mailchimp subtree; retained until the Pliny bridge is reduced.',
  },
  {
    descriptor: 'uuid@npm:^9.0.1',
    target: 'npm:11.1.1',
    rationale: 'Minimum fixed UUID release, verified through Contentlayer2 MDX compilation.',
  },
]

export const ACCEPTED_TRANSITIVE_RISKS = [
  {
    packages: ['@opentelemetry/core@1.30.1', '@opentelemetry/propagator-jaeger@1.30.1'],
    severity: 'high',
    exposure: 'Contentlayer2 build-time tracing only; not wired to public request headers.',
    decision: 'hold until Contentlayer2 supports the coordinated OpenTelemetry 2.x security line.',
  },
  {
    packages: ['brace-expansion@1.1.18', 'brace-expansion@2.1.4'],
    severity: 'high',
    exposure: 'Lint/build glob matching; no public user-controlled pattern input.',
    decision: 'hold because forcing brace-expansion 5 breaks the installed minimatch API contract.',
  },
  {
    packages: ['glob@10.5.0', 'glob@7.2.3', 'inflight@1.0.6'],
    severity: 'moderate',
    exposure: 'Package installation/build tooling only.',
    decision: 'hold until upstream node-gyp and Pliny/copyfiles paths are replaced.',
  },
].map((entry) => ({
  ...entry,
  owner: 'G002-runtime-and-dependency-modernization',
  reviewAfter: '2026-08-30',
}))

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function safeExec(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8' }).trim()
  } catch (error) {
    if (error.stdout) return error.stdout.toString().trim()
    return ''
  }
}

function getOutdated() {
  const result = spawnSync('npm', ['outdated', '--json', '--long'], {
    encoding: 'utf8',
  })

  if (!result.stdout.trim()) return {}
  return JSON.parse(result.stdout)
}

function getPackageManagerVersions() {
  return {
    node: process.version,
    yarn: safeExec('yarn', ['--version']),
    npm: safeExec('npm', ['--version']),
  }
}

function decisionFor(name, current, latest, type) {
  if (current === latest) {
    return {
      target: current,
      decision: 'current',
      rationale: 'Already at registry latest at ledger capture time.',
    }
  }

  const hold = (target, rationale) => ({
    target,
    decision: 'hold',
    rationale,
  })

  if (name === 'typescript') {
    return hold(
      '6.0.3',
      'TypeScript 7 is outside the typescript-eslint 8.65 supported range (<6.1.0).'
    )
  }

  if (name === 'eslint') {
    return hold(
      '9.39.5',
      'ESLint 10 crashes in eslint-plugin-react and is outside the peer ranges of Next 16 import, React, and accessibility plugins.'
    )
  }

  return {
    target: latest,
    decision: 'upgrade',
    rationale: `Upgrade ${type} direct dependency to latest stable compatible version in its cohort.`,
  }
}

export function buildDependencyLedger({ outdated = getOutdated() } = {}) {
  const packageJson = readJson('package.json')
  const sections = ['dependencies', 'devDependencies']
  const entries = []
  const resolutionMap = packageJson.resolutions || {}
  const securityResolutions = SECURITY_RESOLUTION_DECISIONS.map((entry) => ({
    ...entry,
    configured: resolutionMap[entry.descriptor] === entry.target,
    owner: 'G002-runtime-and-dependency-modernization',
    reviewAfter: '2026-08-30',
  }))

  for (const section of sections) {
    for (const [name, declared] of Object.entries(packageJson[section] || {})) {
      const registry = outdated[name]
      const current = registry?.current || declared
      const latest = registry?.latest || current
      const decision = decisionFor(name, current, latest, section)

      entries.push({
        name,
        section,
        declared,
        current,
        wanted: registry?.wanted || current,
        latest,
        homepage: registry?.homepage || null,
        owner: 'G002-runtime-and-dependency-modernization',
        reviewAfter: '2026-08-30',
        ...decision,
      })
    }
  }

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    packageManager: packageJson.packageManager,
    runtime: getPackageManagerVersions(),
    nodeTarget: {
      version: '24.18.0',
      rationale:
        'Latest Node 24 Krypton LTS patch at ledger capture time and the project runtime contract.',
    },
    counts: {
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      total: entries.length,
      upgrade: entries.filter((entry) => entry.decision === 'upgrade').length,
      hold: entries.filter((entry) => entry.decision === 'hold').length,
      removed: REMOVED_DIRECT_DEPENDENCIES.length,
      current: entries.filter((entry) => entry.decision === 'current').length,
    },
    removedDirectDependencies: REMOVED_DIRECT_DEPENDENCIES,
    securityResolutions,
    acceptedTransitiveRisks: ACCEPTED_TRANSITIVE_RISKS,
    entries: entries.sort((a, b) => a.name.localeCompare(b.name)),
  }
}

function writeLedger(filePath = LEDGER_PATH) {
  const ledger = buildDependencyLedger()
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, JSON.stringify(ledger, null, 2) + '\n')
  return ledger
}

function main() {
  const args = process.argv.slice(2)
  const writeIndex = args.indexOf('--write')
  const result =
    writeIndex === -1 ? buildDependencyLedger() : writeLedger(args[writeIndex + 1] || LEDGER_PATH)

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
