import type { ReactNode } from 'react'
import type { Job } from 'contentlayer/generated'
import Link from '@/components/Link'

type JobDetailProps = {
  job: Job
  children: ReactNode
}

const workingModeLabels = {
  ONSITE: '오피스',
  HYBRID: '하이브리드',
  REMOTE: '리모트',
} as const

export default function JobDetail({ job, children }: JobDetailProps) {
  return (
    <article className="pb-20">
      <header className="border-b border-gray-200 pb-10 dark:border-gray-800">
        <div className="mb-8">
          <Link
            href="/careers"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            채용으로 돌아가기
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-signal-700 dark:text-signal-300 mb-4 text-sm font-semibold">채용</p>
            <h1 className="text-4xl font-semibold tracking-normal text-gray-950 sm:text-5xl dark:text-gray-50">
              {job.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              {job.summary}
            </p>
          </div>
          <aside className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-gray-950 dark:text-gray-100">함께하는 곳</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">{job.location}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-950 dark:text-gray-100">일하는 방식</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">
                  {workingModeLabels[job.workingMode]}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-950 dark:text-gray-100">참여 형태</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">Co-founder · 전업</dd>
              </div>
            </dl>
            <Link
              href={job.applyUrl}
              className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400 mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              GitHub에서 공개 작업 보기 ↗
            </Link>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
              회사 GitHub 조직에서 공개된 작업과 문제의식을 확인할 수 있습니다.
            </p>
          </aside>
        </div>
      </header>

      <section className="grid gap-10 py-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">함께할 일</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">서로 확인할 것</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {job.qualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="prose dark:prose-invert max-w-none pt-4">{children}</div>
    </article>
  )
}
