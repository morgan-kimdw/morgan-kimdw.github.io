import { allJobs, type Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

import Link from '@/components/Link'
import StoryCard from '@/components/home/StoryCard'
import { company } from '@/data/company'

interface HomeProps {
  posts: CoreContent<Blog>[]
}

export default function Home({ posts }: HomeProps) {
  const [leadStory, ...secondaryStories] = posts.slice(0, 3)
  const homeRole = allJobs.find((job) => job.isPublic)

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
            {company.coreStatement}
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-4">
          <p className="max-w-xl text-lg leading-8 font-medium text-gray-800 dark:text-gray-100">
            1원칙으로 생각하고, 작게 실행하며, 배운 것을 다음 실행에 남깁니다.
          </p>
          <Link
            href="/blog"
            className="hover:bg-primary-600 dark:hover:bg-primary-300 mt-8 inline-flex min-h-12 items-center self-start bg-gray-950 px-5 font-semibold text-white transition-colors dark:bg-white dark:text-gray-950"
          >
            실행 기록 읽기 →
          </Link>
        </div>
      </section>

      {leadStory && (
        <section className="py-12 sm:py-16" aria-labelledby="featured-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 id="featured-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              우리가 해 본 일
            </h2>
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

      {homeRole && (
        <section
          className="grid gap-6 border-t border-gray-300 py-10 lg:grid-cols-12 dark:border-gray-700"
          aria-labelledby="hiring-preview-title"
        >
          <div className="lg:col-span-4">
            <p className="text-signal-700 dark:text-signal-300 text-sm font-semibold">채용</p>
            <h2 id="hiring-preview-title" className="mt-3 text-3xl font-semibold tracking-tight">
              {homeRole.title}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <p className="max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
              {homeRole.summary}
            </p>
            <Link
              href={`/careers/${homeRole.slug}`}
              className="text-primary-600 dark:text-primary-400 mt-5 inline-flex min-h-11 items-center font-semibold"
            >
              채용 보기 →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
