import { allJobs } from 'contentlayer/generated'
import { genPageMetadata } from '@/app/seo'
import JobCard from '@/components/careers/JobCard'
import { company } from '@/data/company'

export const metadata = genPageMetadata({
  title: 'Co-founder',
  description: `${company.name}의 공동창업자 기준을 확인하세요.`,
})

const publicJobs = allJobs
  .filter((job) => job.isPublic)
  .sort((a, b) => Number(new Date(b.postedAt)) - Number(new Date(a.postedAt)))

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
      <header className="max-w-3xl">
        <p className="text-signal-700 dark:text-signal-300 text-sm font-semibold">Co-founder</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-gray-950 sm:text-5xl dark:text-gray-50">
          모든 문제를 근본에서 해결할 Co-founder를 찾습니다.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          온톨로지가 드러내는 구조와 AI의 작동 원리를 이해하고, 관찰과 1원칙 사고, 학습과 실행의
          루프로 근본 문제를 함께 풀어갈 창업 파트너를 기다립니다.
        </p>
      </header>

      <section className="mt-14" aria-labelledby="open-roles">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="open-roles"
              className="text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50"
            >
              지금 열려 있는 단 하나의 기회
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              회사의 방향, 소유권, 위험, 실행을 함께 책임지는 Co-founder 자리입니다.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {publicJobs.length}개 자리
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
              다음 Co-founder 대화를 준비하고 있습니다.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              함께 해결할 근본 문제와 창업 기준을 이 페이지에 먼저 공개합니다.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
