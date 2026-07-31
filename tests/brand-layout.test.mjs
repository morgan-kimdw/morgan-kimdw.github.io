import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

const root = new URL('../', import.meta.url)

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

function readPngDimensions(relativePath) {
  const png = readFileSync(new URL(`../${relativePath}`, import.meta.url))

  assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG')

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  }
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
    const companyPage = read('app/company/page.tsx')
    const footer = read('components/Footer.tsx')
    const header = read('components/Header.tsx')
    const headerNav = read('data/headerNavLinks.ts')
    const about = read('app/about/page.tsx')
    const author = read('data/authors/default.mdx')
    const metadata = read('data/siteMetadata.js')

    assert.match(company, /name: 'Aegifold Technologies'/)
    assert.match(company, /coreBrandLine: 'Aegifold — The Compounding Company'/)
    assert.match(company, /coreStatement: '한 번의 실행이 다음 실행을 더 낫게 만듭니다\.'/)
    assert.match(company, /문제를 깊이 이해하고, 작은 실행에서 얻은 배움을 다음 실행에 남깁니다/)
    assert.doesNotMatch(company, /nameFormula|nameMeaning/)
    assert.match(company, /primaryValue:/)
    assert.match(company, /primaryValue: '1원칙 사고'/)
    assert.match(company, /다음 18시간 안에 끝낼 중요한 일 3~5개/)
    assert.match(company, /시간의 80% 이상/)
    assert.match(company, /작게 실행하고 다시 고릅니다/)
    assert.match(company, /결과에서 배운 뒤, 다음 실행을 고릅니다/)
    assert.doesNotMatch(company, /1st principle thinking|결과를 배우는 순간|1원칙 재사고|실행계/i)
    assert.match(home, /company\.coreBrandLine/)
    assert.match(home, /company\.coreStatement/)
    assert.match(home, /posts\.slice\(0, 3\)/)
    assert.match(home, /allJobs/)
    assert.match(home, /채용/)
    assert.match(home, /homeRole\.summary/)
    assert.doesNotMatch(home, /CareerCallout|company\.series|company\.principles|recentStories/)
    assert.doesNotMatch(home, /Selected work|Series|How we work|First principle|공동창업자/)
    assert.doesNotMatch(home, /avatar\.jpeg|Kim, Dong-Wook|Written by builders/)
    assert.doesNotMatch(footer, /SocialIcon|siteMetadata\.(email|github|linkedin)|mailto:/)
    assert.match(footer, />채용</)
    assert.doesNotMatch(footer, /공동창업자/)
    assert.doesNotMatch(headerNav, /\/about|작성자/)
    assert.match(headerNav, /title: '채용'/)
    assert.doesNotMatch(headerNav, /공동창업자/)
    assert.match(header, /src="\/static\/images\/logo-header\.png"/)
    assert.doesNotMatch(header, /src="\/static\/images\/logo\.png"/)
    assert.doesNotMatch(header, /src="\/static\/favicons\/apple-touch-icon\.png"/)
    assert.doesNotMatch(header, />\s*A\s*<\/span>/)
    assert.match(companyPage, /company\.coreBrandLine/)
    assert.match(companyPage, /company\.companyAttitude/)
    assert.doesNotMatch(companyPage, /company\.nameMeaning|company\.nameFormula/)
    assert.match(companyPage, /실행에서 배운 것이 다음 성과의 기반이 됩니다/)
    assert.match(companyPage, /우리는 이렇게 일합니다/)
    assert.doesNotMatch(companyPage, /People and stories|company\.mission/)
    assert.match(about, /redirect\('\/company'\)/)
    assert.match(author, /name: Aegifold Technologies/)
    assert.doesNotMatch(author, /avatar:|email:|linkedin:|github:|Kim, Dong-Wook/)
    assert.doesNotMatch(`${company}\n${author}\n${metadata}`, /지켜야 할 것을 보호하고/)
    assert.match(
      metadata,
      /siteLogo: `\$\{process\.env\.BASE_PATH \|\| ''\}\/static\/images\/logo\.png`/
    )
    assert.match(
      metadata,
      /socialBanner: `\$\{process\.env\.BASE_PATH \|\| ''\}\/static\/images\/logo\.png`/
    )

    const logo = readFileSync(new URL('../public/static/images/logo.png', import.meta.url))
    assert.deepEqual(readPngDimensions('public/static/images/logo-header.png'), {
      width: 96,
      height: 96,
    })
    assert.ok(
      statSync(new URL('../public/static/images/logo-header.png', import.meta.url)).size <= 10000
    )
    assert.equal(
      createHash('sha256').update(logo).digest('hex'),
      '1818d35201035d281c719cb3df8f445c5852dacfd6c934fd60e8da40c79684c7'
    )
  })
})

describe('home editorial layout', () => {
  it('keeps three selected stories intrinsically sized and the next routes quiet', () => {
    const storyCard = read('components/home/StoryCard.tsx')
    const home = read('app/Main.tsx')

    assert.doesNotMatch(storyCard, /\bh-full\b/)
    assert.match(storyCard, /<Link[\s\S]*?<article/)
    assert.match(storyCard, /focus-visible:outline/)
    assert.doesNotMatch(storyCard, /<h3[\s\S]*?<Link/)
    assert.match(home, /grid gap-8 lg:grid-cols-12 lg:items-start/)
    assert.match(home, /className="space-y-8 lg:col-span-5"/)
    assert.match(home, /articlePurpose/)
    assert.match(home, /채용 보기/)
  })
})

describe('simple public page ownership', () => {
  it('keeps company method on the company page and removes recruiting from article endings', () => {
    const articleFooter = read('components/ArticleFooter.tsx')
    const blogList = read('layouts/ListLayoutWithTags.tsx')
    const footer = read('components/Footer.tsx')
    const storyCard = read('components/home/StoryCard.tsx')
    const postLayout = read('layouts/PostLayout.tsx')
    const tagsPage = read('app/tags/page.tsx')
    const tagPage = read('app/tags/[tag]/page.tsx')
    const paginatedTagPage = read('app/tags/[tag]/page/[page]/page.tsx')

    assert.doesNotMatch(articleFooter, /CareerCallout|Co-founder/)
    assert.doesNotMatch(
      blogList,
      /문제를 어떻게 보았고, 무엇을 실행했으며, 결과에서 무엇을 배웠는지/
    )
    assert.doesNotMatch(blogList, /tagData|<Tag|주제 필터|주제별 보기|\/tags\//)
    assert.doesNotMatch(storyCard, /post\.tags|\/tags\//)
    assert.match(storyCard, /post\.summary/)
    assert.doesNotMatch(postLayout, /<Tag|주제|\/tags\//)
    assert.match(tagsPage, /redirect\('\/blog'\)/)
    assert.match(tagPage, /redirect\('\/blog'\)/)
    assert.match(paginatedTagPage, /redirect\('\/blog'\)/)
    assert.doesNotMatch(footer, /href="\/tags"/)
  })
})

describe('Co-founder-only recruiting', () => {
  it('publishes one company-building role and removes the generic frontend sample', () => {
    const careers = read('app/careers/page.tsx')
    const jobCard = read('components/careers/JobCard.tsx')
    const jobDetail = read('components/careers/JobDetail.tsx')
    const cofounder = read('data/jobs/co-founder.mdx')

    assert.match(careers, /Co-founder/)
    assert.match(careers, /문제를 근본적으로 해결할 Co-founder/)
    assert.match(careers, /온톨로지/)
    assert.match(careers, /작은 실행에서 함께 배우고 싶은 분을 찾습니다/)
    assert.doesNotMatch(careers, /작은 실행에서 함께 배우고 싶은 분과 대화합니다/)
    assert.doesNotMatch(careers, /공동창업자/)
    assert.match(jobCard, /Co-founder · Full time/)
    assert.match(jobDetail, /Co-founder · Full time/)
    assert.doesNotMatch(`${jobCard}\n${jobDetail}`, /전업/)
    assert.doesNotMatch(jobCard, /공동창업자/)
    assert.doesNotMatch(jobDetail, /공동창업자/)
    assert.doesNotMatch(careers, /채용하지|일반 직원|운영하지/)
    assert.match(cofounder, /^title: Co-founder$/m)
    assert.match(cofounder, /ontology/i)
    assert.match(cofounder, /AI/)
    assert.match(cofounder, /문제를 근본적으로 해결하고 싶고/)
    assert.doesNotMatch(cofounder, /근본 문제/)
    assert.match(cofounder, /다음 18시간 안에 끝낼 중요한 일 3~5개/)
    assert.match(cofounder, /시간의 80% 이상/)
    assert.doesNotMatch(cofounder, /research|연구/i)
    assert.doesNotMatch(cofounder, /모든 문제를 근본에서 해결|결과를 배우는 순간|1원칙에서|실행계/)
    assert.deepEqual(
      readdirSync(new URL('../data/jobs', import.meta.url))
        .filter((fileName) => fileName.endsWith('.mdx'))
        .sort(),
      ['co-founder.mdx']
    )
  })
})
