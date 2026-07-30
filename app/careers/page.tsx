import { allJobs } from 'contentlayer/generated'
import { genPageMetadata } from '@/app/seo'
import JobCard from '@/components/careers/JobCard'
import { company } from '@/data/company'

export const metadata = genPageMetadata({
  title: 'Careers',
  description: `${company.name}의 열린 포지션과 일하는 방식을 확인하세요.`,
})

const publicJobs = allJobs
  .filter((job) => job.isPublic)
  .sort((a, b) => Number(new Date(b.postedAt)) - Number(new Date(a.postedAt)))

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
      <header className="max-w-3xl">
        <p className="text-signal-700 dark:text-signal-300 text-sm font-semibold">Careers</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-gray-950 sm:text-5xl dark:text-gray-50">
          글을 읽고 팀을 판단할 수 있는 채용 페이지
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          {company.name}은 기술 글, 제품 코드, 채용 경험을 같은 기준으로 다룹니다. 열린 포지션은
          역할의 기대치와 지원 흐름을 숨기지 않습니다.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="open-roles">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="open-roles"
              className="text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50"
            >
              열린 포지션
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              초안과 닫힌 공고는 공개 목록과 상세 페이지에 노출하지 않습니다.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {publicJobs.length}개 포지션
          </p>
        </div>

        {publicJobs.length > 0 ? (
          <div className="mt-8 space-y-5">
            {publicJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-gray-200 p-8 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">
              지금은 열린 포지션이 없습니다.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              새 역할이 열리면 이 페이지에 먼저 공개합니다.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
