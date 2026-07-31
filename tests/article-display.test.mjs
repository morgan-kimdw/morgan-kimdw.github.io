import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  articlePurpose,
  getArticleDisplayTitle,
  toArticleDisplay,
} from '../lib/content/article-display.mjs'

function read(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

describe('article display SSOT', () => {
  it('removes only the retired review prefixes from public titles', () => {
    assert.equal(getArticleDisplayTitle('[후기] 현업에서 써먹는 자동화'), '현업에서 써먹는 자동화')
    assert.equal(getArticleDisplayTitle('[후기]'), '')
    assert.equal(
      getArticleDisplayTitle('[후기][FEops] 내부 로컬 배포 플랫폼 럼버잭 제작기'),
      '내부 로컬 배포 플랫폼 럼버잭 제작기'
    )
    assert.equal(
      getArticleDisplayTitle('[에세이] 본질을 추구하는 것의 의미'),
      '[에세이] 본질을 추구하는 것의 의미'
    )
  })

  it('keeps one plain purpose sentence for home and blog lists', () => {
    assert.equal(articlePurpose, '다음 실행을 더 낫게 만들기 위해, 해 본 일과 배운 것을 씁니다.')
    assert.match(read('app/Main.tsx'), /\{articlePurpose\}/)
    assert.match(read('layouts/ListLayoutWithTags.tsx'), /\{articlePurpose\}/)
  })

  it('removes the source prefix at the public serialization boundary', () => {
    const source = {
      title: '[후기][FEops] 내부 로컬 배포 플랫폼 럼버잭 제작기',
      displayTitle: '오래된 표시 제목',
      slug: 'lumberjack',
    }

    assert.deepEqual(toArticleDisplay(source), {
      title: '내부 로컬 배포 플랫폼 럼버잭 제작기',
      displayTitle: '내부 로컬 배포 플랫폼 럼버잭 제작기',
      slug: 'lumberjack',
    })
    assert.equal(source.title, '[후기][FEops] 내부 로컬 배포 플랫폼 럼버잭 제작기')
  })

  it('routes public title surfaces through the generated display title', () => {
    const publicSurfaces = [
      'components/home/StoryCard.tsx',
      'components/ArticleFooter.tsx',
      'layouts/ListLayoutWithTags.tsx',
      'layouts/PostLayout.tsx',
      'layouts/PostSimple.tsx',
      'layouts/PostBanner.tsx',
      'app/blog/[...slug]/page.tsx',
      'scripts/rss.mjs',
    ]

    for (const surface of publicSurfaces) {
      assert.match(read(surface), /displayTitle|getArticleDisplayTitle/, surface)
    }

    for (const layout of [
      'layouts/PostLayout.tsx',
      'layouts/PostSimple.tsx',
      'layouts/PostBanner.tsx',
    ]) {
      assert.doesNotMatch(read(layout), /next\?: \{ path: string; title: string \}/, layout)
      assert.doesNotMatch(read(layout), /prev\?: \{ path: string; title: string \}/, layout)
    }

    for (const boundary of [
      'app/page.tsx',
      'app/blog/page.tsx',
      'app/blog/page/[page]/page.tsx',
      'app/blog/[...slug]/page.tsx',
      'contentlayer.config.ts',
    ]) {
      assert.match(read(boundary), /toArticleDisplay/, boundary)
    }
  })
})
