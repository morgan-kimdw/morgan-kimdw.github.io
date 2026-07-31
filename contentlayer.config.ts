import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { company } from './data/company'
import { getPublishedPosts } from './lib/content/public-content.mjs'
import { getArticleDisplayTitle, toArticleDisplay } from './lib/content/article-display.mjs'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import type { MDXDocument } from 'pliny/utils/contentlayer.js'
import prettier from 'prettier'

const root = process.cwd()

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

const blogComputedFields: ComputedFields = {
  ...computedFields,
  displayTitle: { type: 'string', resolve: (doc) => getArticleDisplayTitle(doc.title) },
}

const jobStatuses = ['open', 'closed'] as const
const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN'] as const
const workingModes = ['ONSITE', 'HYBRID', 'REMOTE'] as const

function assertAllowedValue(field: string, value: string, allowedValues: readonly string[]) {
  if (!allowedValues.includes(value)) {
    throw new Error(`${field} must be one of: ${allowedValues.join(', ')}`)
  }
}

function assertNonEmptyList(field: string, value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== 'string')
  ) {
    throw new Error(`${field} must be a non-empty list of strings`)
  }
}

function assertApplicationUrl(value: string) {
  if (!value.startsWith('mailto:') && !value.startsWith('https://')) {
    throw new Error('applyUrl must be a mailto: or https:// URL')
  }
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
type GeneratedBlog = MDXDocument & {
  date: string
  displayTitle: string
  draft?: boolean
  slug: string
  tags?: string[]
  title: string
}

async function createTagCount(allBlogs: GeneratedBlog[]) {
  const tagCount: Record<string, number> = {}
  getPublishedPosts(allBlogs).forEach((file) => {
    if (file.tags) {
      file.tags.forEach((tag) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  const sortedTagCount = Object.fromEntries(
    Object.entries(tagCount).sort(([left], [right]) => left.localeCompare(right))
  )
  const formatted = await prettier.format(JSON.stringify(sortedTagCount, null, 2), {
    parser: 'json',
  })
  writeFileSync('./app/tag-data.json', formatted)
}

function createSearchIndex(allBlogs: GeneratedBlog[]) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(getPublishedPosts(allBlogs))).map(toArticleDisplay))
    )
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
    category: { type: 'string' },
    series: { type: 'string' },
    featured: { type: 'boolean' },
    comments: { type: 'boolean' },
    hero: { type: 'string' },
  },
  computedFields: {
    ...blogComputedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: getArticleDisplayTitle(doc.title),
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    bluesky: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export const Job = defineDocumentType(() => ({
  name: 'Job',
  filePathPattern: 'jobs/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    summary: { type: 'string', required: true },
    team: { type: 'string', required: true },
    location: { type: 'string', required: true },
    workingMode: { type: 'enum', options: workingModes, required: true },
    employmentType: { type: 'enum', options: employmentTypes, required: true },
    experience: { type: 'string', required: true },
    status: { type: 'enum', options: jobStatuses, required: true },
    draft: { type: 'boolean' },
    postedAt: { type: 'date', required: true },
    validThrough: { type: 'date' },
    applyUrl: { type: 'string', required: true },
    skills: { type: 'json', required: true },
    responsibilities: { type: 'json', required: true },
    qualifications: { type: 'json', required: true },
  },
  computedFields: {
    ...computedFields,
    isPublic: {
      type: 'boolean',
      resolve: (doc) => doc.draft === false && doc.status === 'open',
    },
    validation: {
      type: 'json',
      resolve: (doc) => {
        assertAllowedValue('status', doc.status, jobStatuses)
        assertAllowedValue('employmentType', doc.employmentType, employmentTypes)
        assertAllowedValue('workingMode', doc.workingMode, workingModes)
        assertApplicationUrl(doc.applyUrl)
        assertNonEmptyList('skills', doc.skills)
        assertNonEmptyList('responsibilities', doc.responsibilities)
        assertNonEmptyList('qualifications', doc.qualifications)
        return { ok: true }
      },
    },
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: doc.title,
        description: doc.summary,
        datePosted: doc.postedAt,
        validThrough: doc.validThrough,
        employmentType: doc.employmentType,
        hiringOrganization: {
          '@type': 'Organization',
          name: company.name,
          sameAs: siteMetadata.siteUrl,
        },
        ...(doc.workingMode === 'REMOTE'
          ? {
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: {
                '@type': 'Country',
                name: 'KR',
              },
            }
          : {
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'KR',
                  addressLocality: doc.location,
                },
              },
            }),
        directApply: false,
        url: `${siteMetadata.siteUrl}/careers/${doc._raw.flattenedPath.replace(/^jobs\//, '')}`,
      }),
    },
  },
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, Job],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: icon,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allBlogs } = await importData()
    createTagCount(allBlogs)
    createSearchIndex(allBlogs)
  },
})
