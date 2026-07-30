import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

import CareerCallout from '@/components/CareerCallout'
import Image from '@/components/Image'
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
        className="grid gap-10 border-b border-gray-300 py-16 sm:py-24 lg:grid-cols-12 lg:py-32 dark:border-gray-700"
        aria-labelledby="home-title"
      >
        <div className="lg:col-span-8">
          <p className="text-primary-600 dark:text-primary-400 mb-6 text-sm font-semibold tracking-[0.18em] uppercase">
            {company.name}
          </p>
          <h1
            id="home-title"
            className="max-w-5xl text-5xl leading-[0.98] font-semibold text-gray-950 sm:text-7xl lg:text-[5.75rem] dark:text-white"
          >
            만드는 과정까지
            <br />
            우리의 제품입니다.
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-4">
          <p className="max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {company.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="hover:bg-primary-600 dark:hover:bg-primary-300 inline-flex min-h-12 items-center bg-gray-950 px-5 font-semibold text-white transition-colors dark:bg-white dark:text-gray-950"
            >
              기술 이야기 읽기
            </Link>
            <Link
              href="/careers"
              className="hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 inline-flex min-h-12 items-center border border-gray-400 px-5 font-semibold text-gray-900 transition-colors dark:border-gray-600 dark:text-white"
            >
              함께 일하기
            </Link>
          </div>
        </div>
      </section>

      {leadStory && (
        <section className="py-16 sm:py-24" aria-labelledby="featured-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
                Selected work
              </p>
              <h2
                id="featured-title"
                className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                우리가 오래 고민한 문제
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-primary-600 dark:text-primary-400 hidden text-sm font-semibold sm:inline-flex"
            >
              모든 글 보기 →
            </Link>
          </div>
          <div className="grid gap-x-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <StoryCard post={leadStory} featured />
            </div>
            <div className="lg:col-span-5">
              {secondaryStories.map((post) => (
                <StoryCard key={post.path} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="border-y border-gray-300 py-16 sm:py-20 dark:border-gray-700"
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

      <section className="py-16 sm:py-24" aria-labelledby="recent-title">
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
        className="grid gap-10 border-y border-gray-300 py-16 sm:py-20 lg:grid-cols-12 dark:border-gray-700"
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
            기술보다 오래 남는 기준
          </h2>
          <Link
            href="/company"
            className="text-primary-600 dark:text-primary-400 mt-6 inline-flex min-h-11 items-center font-semibold"
          >
            회사와 팀 알아보기 →
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

      <section className="grid gap-8 py-16 sm:py-20 lg:grid-cols-12" aria-labelledby="author-title">
        <div className="flex items-center gap-5 lg:col-span-4">
          <Image
            src="/static/images/avatar.jpeg"
            alt="Kim, Dong-Wook"
            width={88}
            height={88}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-gray-500 uppercase dark:text-gray-400">
              Written by builders
            </p>
            <p className="mt-2 font-semibold">Kim, Dong-Wook</p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <h2 id="author-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            제품을 만드는 사람이 직접 설명합니다.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
            결정의 배경과 바뀐 생각을 숨기지 않는 글은 팀을 판단할 수 있는 가장 정직한 채용 정보라고
            믿습니다.
          </p>
          <Link
            href="/about"
            className="text-primary-600 dark:text-primary-400 mt-5 inline-flex min-h-11 items-center font-semibold"
          >
            작성자 소개 →
          </Link>
        </div>
      </section>

      <div className="pt-16 sm:pt-24">
        <CareerCallout />
      </div>
    </div>
  )
}
