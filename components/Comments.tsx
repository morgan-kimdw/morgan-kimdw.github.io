'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { GiscusProps } from 'pliny/comments'
import siteMetadata from '@/data/siteMetadata'
import { resolveCommentProvider } from '@/lib/comments/config.mjs'

const GiscusComments = dynamic(() => import('@/components/comments/GiscusComments'), {
  ssr: false,
})

export default function Comments({ slug, enabled = true }: { slug: string; enabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const provider = resolveCommentProvider({
    commentsConfig: siteMetadata.comments,
    slug,
    enabled,
  })

  useEffect(() => {
    if (!provider.enabled || shouldLoad) return
    if (!('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [provider.enabled, shouldLoad])

  if (!provider.enabled || !('giscusConfig' in provider) || !provider.giscusConfig) return null

  return (
    <section
      id="comment"
      className="border-t border-gray-300 py-10 text-left text-gray-700 dark:border-gray-700 dark:text-gray-300"
      aria-labelledby="comments-title"
      data-comment-provider="giscus"
      data-comment-thread={provider.threadPath}
    >
      <h2
        id="comments-title"
        className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white"
      >
        댓글
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        GitHub 계정으로 참여하며, 댓글은 GitHub Discussions에서 관리됩니다.
      </p>
      <div ref={containerRef} className="mt-6 min-h-24">
        {shouldLoad ? (
          <GiscusComments config={provider.giscusConfig as GiscusProps} />
        ) : (
          <button
            type="button"
            onClick={() => setShouldLoad(true)}
            className="border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400 min-h-11 border px-4 font-semibold transition-colors dark:hover:bg-gray-900"
          >
            댓글 불러오기
          </button>
        )}
      </div>
    </section>
  )
}
