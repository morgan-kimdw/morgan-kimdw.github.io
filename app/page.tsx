import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { getPublishedPosts } from '@/lib/content/public-content.mjs'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(getPublishedPosts(allBlogs))
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
