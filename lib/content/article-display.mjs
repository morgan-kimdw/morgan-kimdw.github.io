const retiredTitlePrefixPattern = /^(?:\s*\[(?:후기|FEops)\])+\s*/iu

export const articlePurpose = '다음 실행을 더 낫게 만들기 위해, 해 본 일과 배운 것을 씁니다.'

export function getArticleDisplayTitle(title) {
  const normalizedTitle = title.trim()
  return normalizedTitle.replace(retiredTitlePrefixPattern, '').trim()
}

export function toArticleDisplay(article) {
  const displayTitle = getArticleDisplayTitle(article.title)

  return {
    ...article,
    title: displayTitle,
    displayTitle,
  }
}
