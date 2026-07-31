'use client'

import { usePathname } from 'next/navigation'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { getPaginationBasePath } from '@/lib/pagination.mjs'
import { articlePurpose } from '@/lib/content/article-display.mjs'

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
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <div className="pb-12">
      <header className="border-b border-gray-300 py-14 sm:py-20 dark:border-gray-700">
        <h1 className="text-4xl font-semibold text-gray-950 sm:text-6xl dark:text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-gray-600 dark:text-gray-300">{articlePurpose}</p>
      </header>
      <ul className="divide-y divide-gray-300 dark:divide-gray-700">
        {displayPosts.map((post) => {
          const { path, date, displayTitle, summary } = post
          return (
            <li key={path} className="py-8 sm:py-10">
              <article className="grid gap-4 sm:grid-cols-12">
                <dl className="sm:col-span-3">
                  <dt className="sr-only">쓴 날짜</dt>
                  <dd className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    <time dateTime={date} suppressHydrationWarning>
                      {formatDate(date, siteMetadata.locale)}
                    </time>
                  </dd>
                </dl>
                <div className="sm:col-span-9">
                  <h2 className="text-2xl leading-snug font-semibold sm:text-3xl">
                    <Link
                      href={`/${path}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-950 dark:text-white"
                    >
                      {displayTitle}
                    </Link>
                  </h2>
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
  )
}
