import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import { company } from '@/data/company'
import siteMetadata from '@/data/siteMetadata'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-300 py-10 sm:mt-28 dark:border-gray-800">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="text-xl font-semibold tracking-tight">{company.name}</p>
          <p className="mt-3 max-w-md leading-7 text-gray-600 dark:text-gray-300">
            {company.tagline}
          </p>
        </div>
        <nav
          aria-label="하단 메뉴"
          className="grid grid-cols-2 gap-3 text-sm font-medium md:col-span-3"
        >
          <Link href="/blog">스토리</Link>
          <Link href="/company">회사</Link>
          <Link href="/careers">채용</Link>
          <Link href="/tags">주제</Link>
        </nav>
        <div className="md:col-span-3 md:text-right">
          <div className="flex gap-4 md:justify-end">
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
            <SocialIcon kind="github" href={siteMetadata.github} size={6} />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {company.shortName}
          </p>
        </div>
      </div>
    </footer>
  )
}
