export const company = {
  name: 'Aegifold Technologies',
  shortName: 'Aegifold',
  coreBrandLine: 'Aegifold Technologies, The Compounding Company',
  tagline: 'The Compounding Company',
  coreStatement: '지켜야 할 것을 보호하고, 실행과 배움을 겹겹이 쌓아 복리를 만듭니다.',
  nameFormula: 'Aegifold = Aegis + Folding = 보호 + 복리',
  nameMeaning:
    'Aegifold는 Aegis의 보호와 Folding의 축적을 결합한 이름으로, 실행과 배움이 복리가 되는 회사를 뜻합니다.',
  companyAttitude:
    'Aegifold Technologies는 모든 문제를 깊은 이해를 통해 해결하려고 합니다. 다만 실행과 1원칙적 사고의 조화를 중요하게 여깁니다.',
  primaryValue: '1st principle thinking',
  description:
    '지켜야 할 것을 보호하고, 1원칙으로 판단하며, 작은 실행과 배움을 겹겹이 쌓아 복리를 만드는 기술 회사입니다.',
  mission:
    '우리는 온톨로지로 지켜야 할 본질과 관계를 드러내고 AI로 작은 실행을 빠르게 시험합니다. 1원칙으로 판단하고, 결과에서 배운 것을 다음 실행에 쌓아 복리를 만듭니다.',
  signalNoiseRule:
    '매일 다음 18시간 안에 반드시 끝낼 핵심 3~5가지를 Signal로 정합니다. Signal의 완수를 늦추거나 주의를 빼앗는 모든 것을 Noise로 구분하고, 시간의 80% 이상을 Signal 완수에 집중합니다.',
  executionRule:
    '선택한 Signal을 오늘 끝낼 수 있는 작은 단위로 나눠 바로 실행합니다. 결과에서 배운 뒤 1원칙 사고로 의미를 해석하고, 그 배움을 다음 Signal과 실행에 쌓습니다.',
  location: 'Seoul · Remote friendly',
  github: 'https://github.com/aegifold',
  operatingLoop: [
    '관찰',
    'Signal 3~5개 선택',
    '80% 이상 집중',
    '작게 실행',
    '결과에서 학습',
    '1원칙 재검토',
    '다음 Signal 실행',
  ],
  principles: [
    {
      number: '01',
      title: '다음 18시간의 Signal을 정합니다',
      description:
        '반드시 끝낼 핵심 3~5가지를 고르고 시간의 80% 이상을 완수에 집중합니다. 완수를 늦추거나 주의를 빼앗는 것은 Noise로 구분합니다.',
    },
    {
      number: '02',
      title: '1원칙으로 끝까지 생각합니다',
      description:
        '가정과 관습을 걷어내고 더는 나눌 수 없는 지점까지 분해해, 가장 근본적인 원인에서 해법을 다시 세웁니다.',
    },
    {
      number: '03',
      title: '작게 실행하고 배웁니다',
      description:
        '선택한 Signal을 오늘 끝낼 작은 단위로 만들고 바로 움직입니다. 결과에서 배운 뒤 1원칙 사고로 의미를 해석하고 다음 실행을 고릅니다.',
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
      title: '온톨로지가 드러내는 문제',
      description: '개념, 관계, 목적을 선명하게 연결해 근본 문제를 구조화합니다.',
      href: '/tags/ontology',
    },
  ],
} as const

export type Company = typeof company
