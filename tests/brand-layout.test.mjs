import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

const root = new URL('../', import.meta.url)

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

function projectTextFiles() {
  const paths = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8' }
  )
    .split('\0')
    .filter(Boolean)

  return paths.filter((filePath) => {
    if (!existsSync(new URL(`../${filePath}`, import.meta.url))) return false
    if (filePath.startsWith('data/blog/')) return false
    if (filePath.startsWith('.yarn/releases/')) return false
    if (filePath.startsWith('.omx/')) return false
    if (filePath.startsWith('.omc/')) return false
    if (filePath.startsWith('.obsidian/')) return false
    if (path.basename(filePath) === 'Dockerfile') return true
    return /\.(?:css|d\.ts|js|json|jsx|md|mdx|mjs|ts|tsx|txt|ya?ml)$/.test(filePath)
  })
}

describe('Aegifold company identity', () => {
  it('removes the retired identity outside preserved article content', () => {
    const retiredIdentity = new RegExp(`${'mo'}${'el'}`, 'i')
    const offenders = projectTextFiles().filter((filePath) =>
      retiredIdentity.test(readFileSync(new URL(`../${filePath}`, import.meta.url), 'utf8'))
    )

    assert.deepEqual(offenders, [])
  })

  it('uses the company identity and first-principles value instead of a personal profile', () => {
    const company = read('data/company.ts')
    const home = read('app/Main.tsx')
    const footer = read('components/Footer.tsx')
    const headerNav = read('data/headerNavLinks.ts')
    const about = read('app/about/page.tsx')
    const author = read('data/authors/default.mdx')

    assert.match(company, /name: 'Aegifold Technologies'/)
    assert.match(company, /primaryValue:/)
    assert.match(company, /1st principle thinking/i)
    assert.match(company, /operatingLoop: \[/)
    assert.match(company, /'관찰', '1원칙 사고', '작게 실행', '학습', '1원칙 재사고', '반복'/)
    assert.match(company, /signalNoiseRule:/)
    assert.match(company, /다음 18시간 안에 반드시 끝낼 핵심 3~5가지/)
    assert.match(company, /Signal의 완수를 늦추거나 주의를 빼앗는 모든 것을 Noise/)
    assert.match(company, /시간의 80% 이상을 Signal 완수에 집중/)
    assert.doesNotMatch(company, /작은 단위로 만들고 Signal \/ Noise를 높/)
    assert.match(company, /배우는 순간 1원칙 사고가 판단 기준으로 작동/)
    assert.match(home, /company\.primaryValue/)
    assert.match(home, /company\.operatingLoop/)
    assert.match(home, /company\.signalNoiseRule/)
    assert.match(home, /company\.executionRule/)
    assert.doesNotMatch(home, /avatar\.jpeg|Kim, Dong-Wook|Written by builders/)
    assert.doesNotMatch(footer, /SocialIcon|siteMetadata\.(email|github|linkedin)|mailto:/)
    assert.doesNotMatch(headerNav, /\/about|작성자/)
    assert.match(about, /redirect\('\/company'\)/)
    assert.match(author, /name: Aegifold Technologies/)
    assert.doesNotMatch(author, /avatar:|email:|linkedin:|github:|Kim, Dong-Wook/)
  })
})

describe('home editorial layout', () => {
  it('keeps story cards intrinsically sized and selected work explicitly spaced', () => {
    const storyCard = read('components/home/StoryCard.tsx')
    const home = read('app/Main.tsx')

    assert.doesNotMatch(storyCard, /\bh-full\b/)
    assert.match(home, /grid gap-8 lg:grid-cols-12 lg:items-start/)
    assert.match(home, /className="space-y-8 lg:col-span-5"/)
  })
})

describe('Co-founder-only recruiting', () => {
  it('publishes one company-building role and removes the generic frontend sample', () => {
    const careers = read('app/careers/page.tsx')
    const cofounder = read('data/jobs/co-founder.mdx')

    assert.match(careers, /Co-founder/)
    assert.match(careers, /온톨로지/)
    assert.doesNotMatch(careers, /채용하지|일반 직원|운영하지/)
    assert.match(cofounder, /^title: Co-founder$/m)
    assert.match(cofounder, /ontology/i)
    assert.match(cofounder, /AI/)
    assert.match(cofounder, /다음 18시간 안에 반드시 끝낼 핵심 3~5가지/)
    assert.match(cofounder, /시간의 80% 이상/)
    assert.doesNotMatch(cofounder, /research|연구/i)
    assert.deepEqual(
      readdirSync(new URL('../data/jobs', import.meta.url))
        .filter((fileName) => fileName.endsWith('.mdx'))
        .sort(),
      ['co-founder.mdx']
    )
  })
})
