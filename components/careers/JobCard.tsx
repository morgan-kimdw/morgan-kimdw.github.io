import type { Job } from 'contentlayer/generated'
import Link from '@/components/Link'

type JobCardProps = {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="border-t border-gray-300 py-8 dark:border-gray-700">
      <div className="grid gap-6 sm:grid-cols-12">
        <div className="sm:col-span-9">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Co-founder · 전업
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
            <Link href={`/careers/${job.slug}`} aria-label={`${job.title} 안내 보기`}>
              {job.title}
            </Link>
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
            {job.summary}
          </p>
        </div>
        <Link
          href={`/careers/${job.slug}`}
          className="text-primary-600 dark:text-primary-400 inline-flex min-h-11 items-center font-semibold sm:col-span-3 sm:justify-self-end"
        >
          함께할 일 보기 →
        </Link>
      </div>
    </article>
  )
}
