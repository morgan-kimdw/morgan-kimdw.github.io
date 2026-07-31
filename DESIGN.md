# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-07-31
- Primary product surfaces: `/`, `/company`, `/careers`, `/careers/[slug]`, `/blog`, `/blog/[...slug]`
- Evidence reviewed: `.omx/plans/hiring-website-upgrade-prd.md`, current App Router pages, `components/**`, `layouts/**`, `css/tailwind.css`, `data/siteMetadata.js`, current logo/favicons/content images, and the information architecture of `toss.tech`
- Company identity and its proposition are expressed from the centralized `data/company.ts` object.

## Brand

- Core line: “Aegifold — The Compounding Company”.
- Name: “Aegifold = Aegis + Folding = 보호 + 복리”. 실행에서 얻은 지식과 배움을 다음 실행의 기반으로 쌓는다.
- Company attitude: “Aegifold는 문제를 깊이 이해하고, 작은 실행에서 얻은 배움을 다음 실행에 남깁니다.”
- Logo: use the approved black-and-white interwoven shield/compounding mark from `public/static/images/logo.png`; never substitute a letter mark.
- Personality: candid, technically rigorous, calm, and builder-led.
- Trust signals: authored engineering stories, observable execution loops, concrete first-principles decisions, and a transparent Co-founder invitation.
- Avoid: copying Toss’s visual language, generic startup gradients, stock-office photography, inflated claims, vanity metrics, and decorative motion that competes with reading.

## Product goals

- Goals: help visitors understand that Aegifold makes each execution improve the next; show how the company observes, thinks from first principles, learns, and executes; make the Co-founder opportunity easy to evaluate.
- Non-goals: applicant tracking, collecting applicant PII, a database CMS, a social network, or a visual clone of another engineering site.
- Success signals: visitors understand the promise within five seconds, read a story as evidence, inspect the Co-founder responsibility, and never see draft content.

## Personas and jobs

- Primary personas: curious readers, potential Co-founders, collaborators, and maintainers publishing through Git.
- User jobs: understand the fundamental problems the company pursues; judge its reasoning and execution quality; evaluate the Co-founder opportunity; read and discuss technical work.
- Key contexts of use: mobile discovery from shared articles, desktop deep reading, and quick job comparison on a commute.

## Information architecture

- Primary navigation: Stories, Company, Hiring; search and theme controls remain utilities. Hiring currently contains one Co-founder role.
- Core routes/screens: editorial home, all stories, company narrative, hiring index and Co-founder detail, article detail. Legacy tag URLs redirect to the story archive.
- Page ownership: Home holds one promise and three previews; Company holds the name meaning and operating method; Stories holds all public writing; Co-founder holds founding responsibility and fit. Tags remain search metadata and do not render as navigation, filters, badges, or article sections.
- Content hierarchy: company promise → three selected stories → quiet Company/Co-founder routes; article detail → article → related stories → comments.

## Design principles

- Evidence before slogans: lead with articles, practices, and role details instead of superlatives.
- High Signal / Noise: choose the 3–5 mission-critical outcomes for the next 18 waking hours, spend at least 80% of attention completing them, and treat anything that blocks or distracts from completion as Noise.
- Small execution and learning: turn each chosen Signal into work that can start today, learn from the result, and use first-principles thinking to select the next execution.
- Reading is the product: typography, spacing, and focus order take priority over ornamental UI.
- One clear next step: each section has at most one primary action.
- Editorial work and the Co-founder invitation reinforce each other without forcing a conversion.
- Tradeoffs: a smaller component vocabulary and mostly server-rendered UI are preferred over animation-heavy novelty.

## Visual language

- Color: warm paper and ink neutrals; a clear cobalt action color; a sparingly used acid-lime signal for hiring/status. Dark mode uses deep navy rather than pure black.
- Typography: Space Grotesk for Latin display character, Korean system sans for reliable Hangul, large but compact headlines, and a 65–72 character article measure.
- Spacing/layout rhythm: 4/8px base; generous 72–112px section gaps; asymmetrical 12-column desktop compositions; stacked mobile flow.
- Shape/radius/elevation: 12–24px radii, 1px borders, almost no drop shadows; cards feel editorial rather than dashboard-like.
- Motion: 160–240ms state transitions and the existing page transition only; honor reduced motion.
- Imagery/iconography: existing article and author images; simple inline SVG arrows and status marks; no new stock or copied brand illustration.

## Components

- Existing components to reuse: `Link`, `Image`, `ThemeSwitch`, `SearchButton`, `MobileNav`, `Comments`, `MDXComponents`, and the three article layouts.
- New/changed components: editorial hero, story card, company principle list, simple job card, article context/related stories, and accessible skip link.
- Variants and states: story cards support featured/compact; job cards support open/closed; actions support primary/quiet; empty careers state remains informative.
- Token/component ownership: color/type/spacing tokens live in `css/tailwind.css`; content and company facts live under `data/**`; route composition stays in `app/**`.

## Accessibility

- Target standard: WCAG 2.2 AA.
- Keyboard/focus behavior: visible `:focus-visible`, skip-to-content link, semantic landmarks, no click-only cards, and dialogs remain keyboard-managed by Headless UI.
- Contrast/readability: body text and interactive states meet AA; prose uses a restrained line length and never encodes meaning with color alone.
- Screen-reader semantics: logical headings, descriptive link labels, `time`, `address`, and list semantics; decorative marks are hidden.
- Reduced motion and sensory considerations: page and hover transitions are disabled or minimized for `prefers-reduced-motion`.

## Responsive behavior

- Supported breakpoints/devices: 360px mobile, 768px tablet, 1280px desktop, current evergreen browsers.
- Layout adaptations: hero and featured stories collapse from editorial grids to one column; job facts stack; article rail moves inline; primary actions remain thumb reachable.
- Touch/hover differences: all hover affordances have focus equivalents; tap targets are at least 44px; no content depends on hover.

## Interaction states

- Loading: static/server-rendered pages avoid skeletons unless later data becomes dynamic.
- Empty: the Co-founder surface explains when the next conversation is being prepared; lists state when no story matches.
- Error: invalid job/article slugs use `notFound`; invalid content fails validation before build.
- Success: external application links clearly indicate the destination; publishing success is a CLI/Git concern.
- Disabled: closed job actions render as non-interactive status, not a muted link.
- Offline/slow network: core text and navigation remain server-rendered; comments and optional analytics cannot block reading.

## Content voice

- Tone: direct Korean, concrete verbs, short declarative sentences, and respectful second person only where useful.
- Terminology: “글”, “회사”, “채용”, “1원칙 사고”, “배움”, “온톨로지”; use Co-founder only as the role name, explain Signal/Noise once on the Company page, and avoid decorative English outside the brand line.
- Compounding means retained knowledge, systems, and execution learning. In Korean, prefer “다음 실행”, “다음 성과의 기반”, and “쌓다” over an unexplained financial metaphor.
- Microcopy rules: use positive, affirmative language; state what happens after an action; label external destinations; present the Co-founder role only when its content status is open.

## Implementation constraints

- Framework/styling system: Next.js App Router, React 19, Tailwind CSS 4, Contentlayer2 bridge, and MDX.
- Design-token constraints: extend existing Tailwind theme variables; do not add a second styling runtime or UI dependency.
- Performance constraints: mostly Server Components, local/static assets, no auto-playing media, no blocking comment script, and stable layout dimensions.
- Compatibility constraints: preserve all 65 `data/blog` paths/bytes, local `Transition` and `Youtube`, established article URLs, dark mode, static export fallback, and Node standalone readiness.
- Test/screenshot expectations: lint, typecheck, unit tests, build, route smoke, metadata/JSON-LD checks, keyboard/semantic checks, and 360/768/1280 visual inspection when a browser surface is available.

## Open questions

- [ ] Confirm production domain and founder contact address / owner: site owner / impact: metadata and copy only.
- [ ] Confirm the final application destination and recruiting contact / owner: recruiting / impact: job CTA only.
- [ ] Supply any approved company photography or illustration / owner: brand / impact: optional; launch does not depend on it.
