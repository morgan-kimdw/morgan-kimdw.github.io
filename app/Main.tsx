import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

import CareerCallout from '@/components/CareerCallout'
import Link from '@/components/Link'
import StoryCard from '@/components/home/StoryCard'
import { company } from '@/data/company'

interface HomeProps {
  posts: CoreContent<Blog>[]
}

export default function Home({ posts }: HomeProps) {
  const [leadStory, ...secondaryStories] = posts.slice(0, 3)
  const recentStories = posts.slice(3, 9)

  return (
    <div className="pb-12">
      <section
        className="grid gap-8 border-b border-gray-300 py-10 sm:py-14 lg:grid-cols-12 lg:py-16 dark:border-gray-700"
        aria-labelledby="home-title"
      >
        <div className="lg:col-span-8">
          <p className="text-primary-600 dark:text-primary-400 mb-6 text-sm font-semibold tracking-[0.18em] uppercase">
            {company.coreBrandLine}
          </p>
          <h1
            id="home-title"
            className="max-w-5xl text-4xl leading-[1.08] font-semibold text-gray-950 sm:text-5xl lg:text-6xl dark:text-white"
          >
            <span className="block">지켜야 할 것을 보호하고,</span>
            <span className="block">실행과 배움을 겹겹이 쌓아</span>
            <span className="block">복리를 만듭니다.</span>
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-4">
          <p className="max-w-xl text-lg leading-8 font-medium text-gray-800 dark:text-gray-100">
            {company.companyAttitude}
          </p>
          <p className="mt-4 max-w-xl leading-7 text-gray-600 dark:text-gray-300">
            {company.nameMeaning}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="hover:bg-primary-600 dark:hover:bg-primary-300 inline-flex min-h-12 items-center bg-gray-950 px-5 font-semibold text-white transition-colors dark:bg-white dark:text-gray-950"
            >
              글 읽기
            </Link>
            <Link
              href="/careers"
              className="hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 inline-flex min-h-12 items-center border border-gray-400 px-5 font-semibold text-gray-900 transition-colors dark:border-gray-600 dark:text-white"
            >
              Co-founder로 함께하기
            </Link>
          </div>
        </div>
      </section>

      {leadStory && (
        <section className="py-12 sm:py-16" aria-labelledby="featured-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
                Selected work
              </p>
              <h2
                id="featured-title"
                className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                오래 붙잡은 문제들
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-primary-600 dark:text-primary-400 hidden text-sm font-semibold sm:inline-flex"
            >
              모든 글 보기 →
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <StoryCard post={leadStory} featured />
            </div>
            <div className="space-y-8 lg:col-span-5">
              {secondaryStories.map((post) => (
                <StoryCard key={post.path} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="border-y border-gray-300 py-12 sm:py-14 dark:border-gray-700"
        aria-labelledby="series-title"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-signal-700 dark:text-signal-300 text-xs font-semibold tracking-[0.16em] uppercase">
              Series
            </p>
            <h2 id="series-title" className="mt-2 text-3xl font-semibold tracking-tight">
              주제별로 깊게 읽기
            </h2>
          </div>
          <div className="grid gap-0 lg:col-span-9 lg:grid-cols-3">
            {company.series.map((series, index) => (
              <Link
                key={series.title}
                href={series.href}
                className="group border-t border-gray-300 py-6 lg:border-t-0 lg:border-l lg:px-6 dark:border-gray-700"
              >
                <span className="text-xs font-semibold text-gray-400">0{index + 1}</span>
                <h3 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 mt-8 text-xl font-semibold">
                  {series.title}
                </h3>
                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                  {series.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="recent-title">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="recent-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            최근 기록
          </h2>
          <Link
            href="/blog"
            className="text-primary-600 dark:text-primary-400 text-sm font-semibold"
          >
            아카이브 →
          </Link>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
          {recentStories.map((post) => (
            <StoryCard key={post.path} post={post} />
          ))}
        </div>
      </section>

      <section
        className="grid gap-10 border-y border-gray-300 py-12 sm:py-14 lg:grid-cols-12 dark:border-gray-700"
        aria-labelledby="principles-title"
      >
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
            How we work
          </p>
          <h2
            id="principles-title"
            className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            우리가 지키는 가장 중요한 기준
          </h2>
          <p className="mt-4 text-xl font-semibold text-gray-950 dark:text-white">
            {company.primaryValue}
          </p>
          <Link
            href="/company"
            className="text-primary-600 dark:text-primary-400 mt-6 inline-flex min-h-11 items-center font-semibold"
          >
            회사가 일하는 방식 보기 →
          </Link>
        </div>
        <ol className="grid gap-8 lg:col-span-8 lg:grid-cols-3">
          {company.principles.map((principle) => (
            <li
              key={principle.number}
              className="border-t border-gray-300 pt-5 dark:border-gray-700"
            >
              <span className="text-xs font-semibold text-gray-400">{principle.number}</span>
              <h3 className="mt-8 text-xl font-semibold">{principle.title}</h3>
              <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">
                {principle.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 py-12 sm:py-14 lg:grid-cols-12" aria-labelledby="author-title">
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-gray-500 uppercase dark:text-gray-400">
            First principle
          </p>
          <p className="mt-2 text-2xl font-semibold">문제의 이름보다 구조를 먼저 봅니다.</p>
        </div>
        <div className="lg:col-span-8">
          <h2 id="author-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Signal을 정하고, 실행과 배움을 복리로 쌓습니다.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
            온톨로지는 개념과 관계를 드러내는 지도이고, AI는 그 지도를 빠르게 시험하는 실행
            시스템입니다. 결과에서 배운 뒤 1원칙 사고로 의미를 다시 분해하고, 다음 실행을 고릅니다.
          </p>
          <p className="mt-4 max-w-2xl border-l-2 border-gray-950 pl-4 font-semibold text-gray-950 dark:border-white dark:text-white">
            {company.signalNoiseRule}
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
            {company.executionRule}
          </p>
          <ol className="mt-6 flex flex-wrap gap-2" aria-label="Aegifold 실행 루프">
            {company.operatingLoop.map((step, index) => (
              <li
                key={step}
                className="border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700"
              >
                <span className="mr-2 text-gray-400">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <Link
            href="/company"
            className="text-primary-600 dark:text-primary-400 mt-5 inline-flex min-h-11 items-center font-semibold"
          >
            회사의 기준 보기 →
          </Link>
        </div>
      </section>

      <div className="pt-16 sm:pt-24">
        <CareerCallout />
      </div>
    </div>
  )
}
