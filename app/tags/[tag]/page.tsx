import tagData from '@/app/tag-data.json'
import { redirect } from 'next/navigation'

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  return tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
}

export default function TagPage() {
  redirect('/blog')
}
