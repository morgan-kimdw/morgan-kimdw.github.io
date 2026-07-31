import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'

import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'

interface StoryCardProps {
  post: CoreContent<Blog>
  featured?: boolean
}

export default function StoryCard({ post, featured = false }: StoryCardProps) {
  return (
    <Link
      href={`/${post.path}`}
      className="group focus-visible:outline-primary-600 block focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <article
        className={`group-hover:border-primary-600 dark:group-hover:border-primary-400 flex flex-col border-t border-gray-300 py-6 transition-colors dark:border-gray-700 ${
          featured ? 'lg:pr-12' : ''
        }`}
      >
        <div>
          <div className="mb-6 text-xs font-semibold tracking-[0.14em] text-gray-500 uppercase dark:text-gray-400">
            <time dateTime={post.date}>{formatDate(post.date, siteMetadata.locale)}</time>
          </div>
          <h3
            className={`group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
              featured
                ? 'max-w-3xl text-3xl leading-tight font-semibold text-gray-950 sm:text-4xl lg:text-5xl dark:text-white'
                : 'text-2xl leading-snug font-semibold text-gray-950 dark:text-white'
            }`}
          >
            {post.displayTitle}
          </h3>
          {post.summary && (
            <p
              className={`mt-4 leading-7 text-gray-600 dark:text-gray-300 ${
                featured ? 'max-w-2xl text-lg' : 'text-base'
              }`}
            >
              {post.summary}
            </p>
          )}
        </div>
        <span
          className="text-primary-600 dark:text-primary-400 mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold"
          aria-hidden="true"
        >
          글 읽기 <span>↗</span>
        </span>
      </article>
    </Link>
  )
}
