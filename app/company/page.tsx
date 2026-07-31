import Link from '@/components/Link'
import { company } from '@/data/company'
import { genPageMetadata } from '@/app/seo'

export const metadata = genPageMetadata({
  title: '회사',
  description: `${company.name}이 문제를 바라보고 제품을 운영하는 방식`,
})

export default function CompanyPage() {
  return (
    <div className="pb-16">
      <section className="grid gap-10 border-b border-gray-300 py-16 sm:py-24 lg:grid-cols-12 dark:border-gray-700">
        <div className="lg:col-span-4">
          <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-[0.18em] uppercase">
            Company
          </p>
        </div>
        <div className="lg:col-span-8">
          <h1 className="max-w-4xl text-5xl leading-[1.02] font-semibold sm:text-7xl">
            모든 문제를
            <br />
            근본에서 해결합니다.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-9 text-gray-600 dark:text-gray-300">
            {company.mission}
          </p>
        </div>
      </section>

      <section
        className="grid gap-10 py-16 sm:py-24 lg:grid-cols-12"
        aria-labelledby="company-principles"
      >
        <div className="lg:col-span-4">
          <h2 id="company-principles" className="text-3xl font-semibold tracking-tight">
            우리가 일하는 기준
          </h2>
          <p className="mt-4 max-w-sm leading-7 text-gray-600 dark:text-gray-300">
            가장 중요한 가치는 {company.primaryValue}입니다. 관찰한 사실을 끝까지 생각하고, 작게
            실행합니다. 결과를 배우는 순간 1원칙 사고로 다음 실행을 고릅니다.
          </p>
          <p className="mt-4 max-w-sm font-semibold text-gray-950 dark:text-white">
            {company.signalNoiseRule}
          </p>
          <p className="mt-4 max-w-sm leading-7 text-gray-600 dark:text-gray-300">
            {company.executionRule}
          </p>
        </div>
        <ol className="lg:col-span-8">
          {company.principles.map((principle) => (
            <li
              key={principle.number}
              className="grid gap-4 border-t border-gray-300 py-8 sm:grid-cols-12 dark:border-gray-700"
            >
              <span className="text-sm font-semibold text-gray-400 sm:col-span-2">
                {principle.number}
              </span>
              <h3 className="text-2xl font-semibold sm:col-span-4">{principle.title}</h3>
              <p className="leading-7 text-gray-600 sm:col-span-6 dark:text-gray-300">
                {principle.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 border border-gray-300 bg-white p-8 sm:p-12 lg:grid-cols-12 dark:border-gray-700 dark:bg-gray-900">
        <div className="lg:col-span-8">
          <p className="text-signal-700 dark:text-signal-300 text-xs font-semibold tracking-[0.16em] uppercase">
            People and stories
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            관찰 가능한 실행과 학습으로 회사를 설명합니다.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
            글에는 전제, 관찰, 판단, 실행 결과가 함께 드러납니다. 온톨로지, AI 시스템, 1원칙 사고가
            실제 판단을 어떻게 바꾸는지 기록합니다.
          </p>
        </div>
        <div className="flex flex-col items-start justify-end gap-3 lg:col-span-4 lg:items-end">
          <Link href="/blog" className="text-primary-600 dark:text-primary-400 font-semibold">
            엔지니어링 스토리 읽기 →
          </Link>
          <Link href="/careers" className="font-semibold text-gray-700 dark:text-gray-200">
            공동창업자 조건 →
          </Link>
        </div>
      </section>

      <section className="mt-16 flex flex-col justify-between gap-8 border-t border-gray-300 pt-10 sm:flex-row sm:items-end dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{company.location}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            근본 문제를 함께 붙잡을 사람
          </h2>
        </div>
        <Link
          href="/careers"
          className="bg-primary-600 hover:bg-primary-700 inline-flex min-h-12 items-center self-start px-5 font-semibold text-white sm:self-auto"
        >
          공동창업자 조건 보기
        </Link>
      </section>
    </div>
  )
}
