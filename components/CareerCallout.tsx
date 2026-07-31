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
        Founder search
      </p>
      <h2
        id="career-callout-title"
        className={`${compact ? 'mt-2 text-xl' : 'mt-3 text-2xl sm:text-3xl'} font-semibold tracking-tight text-gray-950 dark:text-white`}
      >
        Co-founder와 함께 실행과 배움의 복리를 만듭니다.
      </h2>
      {!compact && (
        <p className="mt-3 max-w-2xl leading-7 text-gray-600 dark:text-gray-300">
          온톨로지와 AI가 실제로 작동하는 조건과 한계를 이해하고, 작게 실행한 결과에서 배우며 다시
          1원칙으로 생각할 창업 파트너를 찾습니다.
        </p>
      )}
      <Link
        href="/careers"
        className="text-primary-600 dark:text-primary-400 mt-5 inline-flex min-h-11 items-center gap-2 font-semibold"
      >
        Co-founder 기회 알아보기 <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
