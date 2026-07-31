import Image from '@/components/Image'
import Link from '@/components/Link'
import MobileNav from '@/components/MobileNav'
import SearchButton from '@/components/SearchButton'
import ThemeSwitch from '@/components/ThemeSwitch'
import headerNavLinks from '@/data/headerNavLinks'
import siteMetadata from '@/data/siteMetadata'

export default function Header() {
  return (
    <header className="bg-paper/95 dark:bg-ink/95 flex min-h-16 w-full items-center justify-between border-b border-gray-300 dark:border-gray-800">
      <Link
        href="/"
        aria-label={`${siteMetadata.headerTitle} 홈`}
        className="inline-flex min-h-11 min-w-0 items-center gap-3 font-semibold"
      >
        <Image
          src="/static/images/logo.png"
          alt=""
          width={36}
          height={36}
          priority
          aria-hidden="true"
          className="h-9 w-9 shrink-0 object-cover"
        />
        <span className="hidden truncate text-sm sm:inline lg:text-base">
          {siteMetadata.headerTitle}
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav
          aria-label="주요 메뉴"
          className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex"
        >
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-600 dark:hover:text-primary-400 inline-flex min-h-11 items-center px-3 text-sm font-semibold text-gray-700 transition-colors dark:text-gray-200"
              >
                {link.title}
              </Link>
            ))}
        </nav>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}
