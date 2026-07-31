export const company = {
  name: 'Aegifold Technologies',
  shortName: 'Aegifold',
  coreBrandLine: 'Aegifold — The Compounding Company',
  tagline: 'The Compounding Company',
  coreStatement: '한 번의 실행이 다음 실행을 더 낫게 만듭니다.',
  companyAttitude:
    'Aegifold는 문제를 깊이 이해하고, 작은 실행에서 얻은 배움을 다음 실행에 남깁니다.',
  primaryValue: '1원칙 사고',
  description:
    '문제를 깊이 이해하고, 작은 실행에서 얻은 지식과 배움을 다음 성과의 기반으로 쌓습니다.',
  location: 'Seoul · Remote friendly',
  github: 'https://github.com/aegifold',
  principles: [
    {
      number: '01',
      title: '사실에서 다시 시작합니다',
      description:
        '당연하다고 여긴 생각을 내려놓고, 확인한 사실을 바탕으로 1원칙부터 다시 생각합니다.',
    },
    {
      number: '02',
      title: '오늘 끝낼 일을 고릅니다',
      description:
        '다음 18시간 안에 끝낼 중요한 일 3~5개를 Signal로 정합니다. 시간의 80% 이상을 여기에 쓰고, 집중을 흐리는 일은 Noise로 둡니다.',
    },
    {
      number: '03',
      title: '작게 실행하고 다시 고릅니다',
      description:
        '오늘 끝낼 수 있는 크기로 만들고 바로 실행합니다. 결과에서 배운 뒤, 다음 실행을 고릅니다.',
    },
  ],
} as const

export type Company = typeof company
