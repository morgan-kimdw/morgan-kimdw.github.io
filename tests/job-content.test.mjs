import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const generatedJobs = JSON.parse(readFileSync('.contentlayer/generated/Job/_index.json', 'utf8'))

const publicJobs = generatedJobs.filter((job) => job.isPublic)

describe('job content', () => {
  it('publishes only open, non-draft jobs', () => {
    assert.equal(publicJobs.length, 1)
    assert.ok(publicJobs.every((job) => job.status === 'open'))
    assert.ok(publicJobs.every((job) => job.draft === false))
  })

  it('includes required application and JobPosting metadata', () => {
    const [job] = publicJobs

    assert.equal(job.slug, 'co-founder')
    assert.equal(job.title, 'Co-founder')
    assert.equal(job.applyUrl, 'https://github.com/aegifold')
    assert.equal(job.structuredData['@type'], 'JobPosting')
    assert.equal(job.structuredData.hiringOrganization.name, 'Aegifold Technologies')
    assert.equal(job.structuredData.url, 'https://morgan-kimdw.github.io/careers/co-founder')
    assert.equal(job.structuredData.jobLocationType, 'TELECOMMUTE')
    assert.equal(job.structuredData.applicantLocationRequirements.name, 'KR')
    assert.equal(job.validation.ok, true)
  })

  it('requires jobs to opt into public visibility explicitly', () => {
    const contentlayerConfig = readFileSync('contentlayer.config.ts', 'utf8')

    assert.match(contentlayerConfig, /draft: \{ type: 'boolean' \}/)
    assert.match(
      contentlayerConfig,
      /resolve: \(doc\) => doc\.draft === false && doc\.status === 'open'/
    )
  })
})
