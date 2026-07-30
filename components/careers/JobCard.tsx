import type { Job } from 'contentlayer/generated'
import Link from '@/components/Link'

type JobCardProps = {
  job: Job
}

const workingModeLabels = {
  ONSITE: '오피스',
  HYBRID: '하이브리드',
  REMOTE: '리모트',
} as const

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="border-primary-200 focus-within:border-primary-500 hover:border-primary-500 dark:border-primary-700 dark:focus-within:border-primary-400 dark:hover:border-primary-400 rounded-2xl border p-6 transition-colors">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="bg-signal-300 rounded-full px-3 py-1 font-medium text-gray-950">
              열린 포지션
            </span>
            <span className="text-gray-500 dark:text-gray-400">{job.team}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
              <Link href={`/careers/${job.slug}`} aria-label={`${job.title} 공고 자세히 보기`}>
                {job.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
              {job.summary}
            </p>
          </div>
        </div>
        <Link
          href={`/careers/${job.slug}`}
          className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          자세히 보기
        </Link>
      </div>
      <dl className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm sm:grid-cols-3 dark:border-gray-800">
        <div>
          <dt className="font-medium text-gray-950 dark:text-gray-100">근무 형태</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-300">
            {workingModeLabels[job.workingMode]}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-950 dark:text-gray-100">위치</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-300">{job.location}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-950 dark:text-gray-100">경력</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-300">{job.experience}</dd>
        </div>
      </dl>
    </article>
  )
}
