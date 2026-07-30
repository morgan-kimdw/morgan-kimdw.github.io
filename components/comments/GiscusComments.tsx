'use client'

import { Giscus, type GiscusProps } from 'pliny/comments'

export default function GiscusComments({ config }: { config: GiscusProps }) {
  return <Giscus {...config} />
}
