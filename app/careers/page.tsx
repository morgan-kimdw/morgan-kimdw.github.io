import { allJobs } from 'contentlayer/generated'
import { genPageMetadata } from '@/app/seo'
import JobCard from '@/components/careers/JobCard'
import { company } from '@/data/company'

export const metadata = genPageMetadata({
  title: 'Co-founder',
  description: `${company.name}와 실행과 배움의 복리를 함께 만들 Co-founder 기회`,
})

const publicJobs = allJobs
  .filter((job) => job.isPublic)
  .sort((a, b) => Number(new Date(b.postedAt)) - Number(new Date(a.postedAt)))

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
      <header className="max-w-3xl">
        <p className="text-signal-700 dark:text-signal-300 text-sm font-semibold">
          Aegifold Technologies
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-gray-950 sm:text-5xl dark:text-gray-50">
          문제를 근본적으로 해결할 Co-founder를 찾습니다.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          회사의 방향, 소유권, 위험, 실행을 함께 책임지는 자리입니다. 온톨로지와 AI가 실제로
          작동하는 방식을 이해하고, 작은 실행에서 함께 배우고 싶은 분과 대화합니다.
        </p>
      </header>

      <section className="mt-12" aria-label="채용 안내">
        {publicJobs.length > 0 ? (
          <div className="space-y-5">
            {publicJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="border-t border-gray-300 py-8 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">
              다음 Co-founder 대화를 준비하고 있습니다.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              문제를 근본적으로 해결하는 방향과 창업 기준을 이 페이지에 먼저 공개합니다.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
