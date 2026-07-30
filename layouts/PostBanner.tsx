import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import ArticleFooter from '@/components/ArticleFooter'
import { isCommentsAvailable } from '@/lib/comments/config.mjs'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  related?: CoreContent<Blog>[]
}

export default function PostMinimal({ content, next, prev, related, children }: LayoutProps) {
  const { slug, title, images, summary, readingTime, comments } = content
  const displayImage = images?.[0]
  const commentsEnabled = isCommentsAvailable(siteMetadata.comments, comments !== false)

  return (
    <SectionContainer>
      <ScrollTopAndComment commentsEnabled={commentsEnabled} />
      <article>
        <div>
          <div className="space-y-1 pb-10 text-center dark:border-gray-700">
            {displayImage && (
              <div className="w-full">
                <Bleed>
                  <div className="relative aspect-2/1 w-full">
                    <Image src={displayImage} alt={title} fill className="object-cover" />
                  </div>
                </Bleed>
              </div>
            )}
            <div className="relative pt-10">
              <PageTitle>{title}</PageTitle>
              {summary && (
                <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                  {summary}
                </p>
              )}
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{readingTime?.text}</p>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
          <ArticleFooter related={related} />
          {commentsEnabled && <Comments slug={slug} />}
          <footer>
            <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
              {prev && prev.path && (
                <div className="pt-4 xl:pt-8">
                  <Link
                    href={`/${prev.path}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={`Previous post: ${prev.title}`}
                  >
                    &larr; {prev.title}
                  </Link>
                </div>
              )}
              {next && next.path && (
                <div className="pt-4 xl:pt-8">
                  <Link
                    href={`/${next.path}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={`Next post: ${next.title}`}
                  >
                    {next.title} &rarr;
                  </Link>
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  )
}
