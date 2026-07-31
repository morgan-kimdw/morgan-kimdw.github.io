import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

import Link from '@/components/Link'

interface ArticleFooterProps {
  related?: CoreContent<Blog>[]
}

export default function ArticleFooter({ related = [] }: ArticleFooterProps) {
  return (
    <div className="py-10">
      {related.length > 0 && (
        <section aria-labelledby="related-stories-title">
          <div className="flex items-end justify-between border-b border-gray-300 pb-4 dark:border-gray-700">
            <h2
              id="related-stories-title"
              className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white"
            >
              이어서 읽을 글
            </h2>
            <Link
              href="/blog"
              className="text-primary-600 dark:text-primary-400 text-sm font-semibold"
            >
              모든 글
            </Link>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {related.slice(0, 3).map((post) => (
              <li key={post.path}>
                <Link
                  href={`/${post.path}`}
                  className="group flex min-h-16 items-center justify-between gap-4 py-4"
                >
                  <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium text-gray-800 dark:text-gray-100">
                    {post.displayTitle}
                  </span>
                  <span aria-hidden="true" className="text-gray-400">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
