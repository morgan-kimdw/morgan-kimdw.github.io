import '@/css/prism.css'

import type { Metadata } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { allJobs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { components } from '@/components/MDXComponents'
import JobDetail from '@/components/careers/JobDetail'
import siteMetadata from '@/data/siteMetadata'
import { company } from '@/data/company'

function getPublicJob(slug: string) {
  return allJobs.find((job) => job.slug === slug && job.isPublic)
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const job = getPublicJob(decodeURI(params.slug))

  if (!job) {
    return
  }

  return {
    title: job.title,
    description: job.summary,
    openGraph: {
      title: `${job.title} | ${company.name}`,
      description: job.summary,
      siteName: siteMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      url: `${siteMetadata.siteUrl}/careers/${job.slug}`,
      images: [siteMetadata.socialBanner],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} | ${company.name}`,
      description: job.summary,
      images: [siteMetadata.socialBanner],
    },
  }
}

export const generateStaticParams = async () => {
  return allJobs.filter((job) => job.isPublic).map((job) => ({ slug: job.slug }))
}

export default async function CareerPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const job = getPublicJob(decodeURI(params.slug))

  if (!job) {
    return notFound()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(job.structuredData) }}
      />
      <JobDetail job={job}>
        <MDXLayoutRenderer code={job.body.code} components={components} toc={job.toc} />
      </JobDetail>
    </div>
  )
}
