export const company = {
  name: 'Moel Engineering',
  shortName: 'Moel',
  tagline: '읽고, 만들고, 운영하며 더 나은 기준을 남깁니다.',
  description:
    '사용자의 맥락을 이해하는 제품과 오래 운영할 수 있는 소프트웨어를 만드는 작은 엔지니어링 팀입니다.',
  mission:
    '복잡한 기술을 과시하는 대신, 복잡한 문제를 이해 가능한 제품과 반복 가능한 시스템으로 바꿉니다.',
  location: 'Seoul · Remote friendly',
  contactEmail: 'moel.kimdw@gmail.com',
  principles: [
    {
      number: '01',
      title: '맥락에서 시작합니다',
      description: '요구사항보다 먼저 사용자가 놓인 상황과 팀이 지켜야 할 제약을 이해합니다.',
    },
    {
      number: '02',
      title: '작게 만들고 끝까지 운영합니다',
      description: '출시를 완료가 아닌 학습의 시작으로 보고, 관찰과 복구까지 설계합니다.',
    },
    {
      number: '03',
      title: '배운 것을 기록합니다',
      description:
        '결정의 이유와 실패의 흔적을 글과 코드로 남겨 다음 사람이 더 빠르게 나아가게 합니다.',
    },
  ],
  series: [
    {
      title: '좋은 프론트엔드 엔지니어',
      description: '기술 선택보다 오래 남는 판단 기준을 탐구합니다.',
      href: '/tags/frontend',
    },
    {
      title: '시스템과 운영',
      description: '배포, 성능, 백엔드 경계를 실제 운영 관점에서 다룹니다.',
      href: '/tags/backend',
    },
    {
      title: '제품을 만드는 태도',
      description: '리더십, 맥락, 회고를 통해 팀의 일하는 방식을 돌아봅니다.',
      href: '/tags/leadership',
    },
  ],
} as const

export type Company = typeof company
