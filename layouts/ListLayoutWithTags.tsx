'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from '@/app/tag-data.json'
import { getPaginationBasePath } from '@/lib/pagination.mjs'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = getPaginationBasePath(pathname)
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            이전
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            이전
          </Link>
        )}
        <span>
          {currentPage} / {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            다음
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            다음
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const activeTag = pathname.startsWith('/tags/')
    ? decodeURI(pathname.split('/tags/')[1].split('/page/')[0])
    : null

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div className="pb-12">
        <header className="border-b border-gray-300 py-14 sm:py-20 dark:border-gray-700">
          <p className="text-primary-600 dark:text-primary-400 text-xs font-semibold tracking-[0.16em] uppercase">
            Engineering archive
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-gray-950 sm:text-6xl dark:text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            제품을 만들고 운영하며 발견한 문제, 선택의 이유, 실패에서 바뀐 생각을 기록합니다.
          </p>
        </header>
        <nav
          aria-label="주제 필터"
          className="no-scrollbar flex gap-2 overflow-x-auto border-b border-gray-300 py-5 lg:hidden dark:border-gray-700"
        >
          <Link
            href="/blog"
            className={`shrink-0 border px-4 py-2 text-sm font-semibold ${
              pathname.startsWith('/blog')
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            전체
          </Link>
          {sortedTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slug(tag)}`}
              className={`shrink-0 border px-4 py-2 text-sm font-semibold ${
                activeTag === slug(tag)
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              {tag}
            </Link>
          ))}
        </nav>
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="hidden pt-10 lg:col-span-3 lg:block">
            <div className="sticky top-6">
              <p className="mb-5 text-xs font-semibold tracking-[0.14em] text-gray-500 uppercase dark:text-gray-400">
                Topics
              </p>
              {pathname.startsWith('/blog') ? (
                <h2 className="text-primary-600 dark:text-primary-400 font-semibold">모든 글</h2>
              ) : (
                <Link
                  href="/blog"
                  className="hover:text-primary-600 dark:hover:text-primary-400 font-semibold text-gray-700 dark:text-gray-300"
                >
                  모든 글
                </Link>
              )}
              <ul className="mt-4">
                {sortedTags.map((t) => {
                  return (
                    <li key={t}>
                      {activeTag === slug(t) ? (
                        <h3 className="border-primary-600 text-primary-600 dark:text-primary-400 block border-l-2 py-2 pl-3 text-sm font-semibold">
                          {`${t} (${tagCounts[t]})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/tags/${slug(t)}`}
                          className="block border-l-2 border-transparent py-2 pl-3 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t} (${tagCounts[t]})`}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
          <div className="lg:col-span-9">
            <ul className="divide-y divide-gray-300 dark:divide-gray-700">
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <li key={path} className="py-8 sm:py-10">
                    <article className="grid gap-4 sm:grid-cols-12">
                      <dl className="sm:col-span-3">
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          <time dateTime={date} suppressHydrationWarning>
                            {formatDate(date, siteMetadata.locale)}
                          </time>
                        </dd>
                      </dl>
                      <div className="sm:col-span-9">
                        <div>
                          <h2 className="text-2xl leading-snug font-semibold sm:text-3xl">
                            <Link
                              href={`/${path}`}
                              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-950 dark:text-white"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="mt-3 flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
