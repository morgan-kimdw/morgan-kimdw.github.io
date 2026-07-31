import type { MetadataRoute } from 'next'
import { allBlogs, allJobs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { getPublishedPosts } from '@/lib/content/public-content.mjs'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = getPublishedPosts(allBlogs).map((post) => ({
    url: `${siteUrl}/${post.path}`,
    lastModified: post.lastmod || post.date,
  }))

  const jobRoutes = allJobs
    .filter((job) => job.isPublic)
    .map((job) => ({
      url: `${siteUrl}/careers/${job.slug}`,
      lastModified: job.postedAt,
    }))

  const routes = ['', 'blog', 'company', 'careers', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes, ...jobRoutes]
}
