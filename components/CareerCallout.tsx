import Link from '@/components/Link'
import { company } from '@/data/company'

interface CareerCalloutProps {
  compact?: boolean
}

export default function CareerCallout({ compact = false }: CareerCalloutProps) {
  return (
    <aside
      className={`border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 ${
        compact ? 'p-6' : 'px-6 py-8 sm:px-8'
      }`}
      aria-labelledby="career-callout-title"
    >
      <p className="text-signal-700 dark:text-signal-300 text-xs font-semibold tracking-[0.16em] uppercase">
        Work with us
      </p>
      <h2
        id="career-callout-title"
        className={`${compact ? 'mt-2 text-xl' : 'mt-3 text-2xl sm:text-3xl'} font-semibold tracking-tight text-gray-950 dark:text-white`}
      >
        이런 문제를 함께 풀고 싶나요?
      </h2>
      {!compact && (
        <p className="mt-3 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
          {company.name}은 제품의 맥락과 운영의 끝까지 책임질 동료를 찾고 있습니다.
        </p>
      )}
      <Link
        href="/careers"
        className="text-primary-600 dark:text-primary-400 mt-5 inline-flex min-h-11 items-center gap-2 font-semibold"
      >
        열린 포지션 보기 <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
