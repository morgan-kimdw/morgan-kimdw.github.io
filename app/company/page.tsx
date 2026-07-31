import Image from '@/components/Image'
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
      <section className="grid gap-10 border-b border-gray-300 py-12 sm:py-20 lg:grid-cols-12 dark:border-gray-700">
        <div className="lg:col-span-4">
          <Image
            src="/static/images/logo.png"
            alt="Aegifold Technologies 로고"
            width={128}
            height={128}
            priority
            className="h-24 w-24 object-cover sm:h-32 sm:w-32"
          />
        </div>
        <div className="lg:col-span-8">
          <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-[0.14em]">
            {company.coreBrandLine}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl leading-[1.08] font-semibold sm:text-6xl">
            실행에서 배운 것이 다음 성과의 기반이 됩니다.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-9 font-medium text-gray-800 dark:text-gray-100">
            {company.companyAttitude}
          </p>
        </div>
      </section>

      <section
        className="grid gap-10 py-12 sm:py-20 lg:grid-cols-12"
        aria-labelledby="company-principles"
      >
        <div className="lg:col-span-4">
          <h2 id="company-principles" className="text-3xl font-semibold tracking-tight">
            우리는 이렇게 일합니다
          </h2>
          <p className="mt-4 max-w-sm leading-7 text-gray-600 dark:text-gray-300">
            가장 중요한 기준은 {company.primaryValue}입니다. 확인한 사실에서 다시 생각하고, 작게
            실행한 뒤, 배운 것을 다음 선택에 남깁니다.
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

      <div className="border-t border-gray-300 pt-8 dark:border-gray-700">
        <Link
          href="/blog"
          className="text-primary-600 dark:text-primary-400 inline-flex min-h-11 items-center font-semibold"
        >
          실행 기록 읽기 →
        </Link>
      </div>
    </div>
  )
}
