export const company = {
  name: 'Aegifold Technologies',
  shortName: 'Aegifold',
  tagline: 'Observe. Think in first principles. Learn. Execute.',
  primaryValue: '1st principle thinking',
  description:
    '모든 문제를 근본에서 해결하기 위해 관찰하고, 1원칙으로 생각하고, 작게 실행하며 배우는 기술 회사입니다.',
  mission:
    '우리는 온톨로지가 드러내는 본질적 구조와 AI가 실제로 작동하는 방식을 관찰합니다. 1원칙으로 가장 깊은 원인까지 생각하고, 배운 것을 실행한 뒤 결과를 다시 관찰합니다.',
  executionRule:
    '문제를 오늘 또는 18시간 안에 실행할 수 있는 작은 단위로 만들고 Signal / Noise를 높입니다. 실행 결과를 배우는 순간 1원칙 사고가 판단 기준으로 작동하며, 그 배움으로 다음 실행을 고릅니다.',
  location: 'Seoul · Remote friendly',
  github: 'https://github.com/aegifold',
  operatingLoop: ['관찰', '1원칙 사고', '작게 실행', '학습', '1원칙 재사고', '반복'],
  principles: [
    {
      number: '01',
      title: '관찰해 Signal / Noise를 높입니다',
      description:
        '현상, 제약, 실패 신호를 직접 보고 문제를 이루는 사실과 관계를 선명하게 만들어 다음 판단의 신호를 키웁니다.',
    },
    {
      number: '02',
      title: '1원칙으로 끝까지 생각합니다',
      description:
        '가정과 관습을 걷어내고 더 깊게 분해되는 지점을 추적해, 가장 근본적인 원인에서 해법을 다시 세웁니다.',
    },
    {
      number: '03',
      title: '작게 실행하고 배웁니다',
      description:
        '오늘 또는 18시간 안에 검증할 작은 단위를 찾습니다. 결과를 배우는 순간 1원칙 사고로 의미를 해석하고 다음 실행을 고릅니다.',
    },
  ],
  series: [
    {
      title: '1원칙 사고',
      description: '문제를 이루는 사실과 원인까지 내려가 해법을 다시 세웁니다.',
      href: '/tags/philosophy',
    },
    {
      title: 'AI가 작동하는 방식',
      description: '모델, 도구, 피드백 루프가 현실의 판단을 어떻게 바꾸는지 다룹니다.',
      href: '/tags/ai',
    },
    {
      title: '온톨로지가 찾는 문제',
      description: '개념, 관계, 목적을 선명하게 연결해 근본 문제를 구조화합니다.',
      href: '/tags/ontology',
    },
  ],
} as const

export type Company = typeof company
