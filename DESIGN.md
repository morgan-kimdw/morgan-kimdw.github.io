# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-07-30
- Primary product surfaces: `/`, `/company`, `/careers`, `/careers/[slug]`, `/blog`, `/blog/[...slug]`
- Evidence reviewed: `.omx/plans/hiring-website-upgrade-prd.md`, current App Router pages, `components/**`, `layouts/**`, `css/tailwind.css`, `data/siteMetadata.js`, current logo/favicons/content images, and the information architecture of `toss.tech`
- Assumption: until the legal company name and production domain are supplied, the existing “Moel” identity is expressed as “Moel Engineering” from one replaceable metadata object.

## Brand

- Personality: candid, technically rigorous, calm, and builder-led.
- Trust signals: authored engineering stories, concrete working principles, transparent role expectations, visible hiring process, and external application handling.
- Avoid: copying Toss’s visual language, generic startup gradients, stock-office photography, inflated claims, vanity metrics, and decorative motion that competes with reading.

## Product goals

- Goals: show how the company thinks; help engineers discover credible technical work; make open roles easy to evaluate and apply for; connect articles to relevant careers without turning articles into ads.
- Non-goals: applicant tracking, collecting applicant PII, a database CMS, a social network, or a visual clone of another engineering site.
- Success signals: article-to-careers navigation, role-detail visits, completed external application clicks, readable long-form content, and zero draft exposure.

## Personas and jobs

- Primary personas: experienced engineers evaluating the team, curious readers, potential collaborators, and maintainers publishing through Git.
- User jobs: understand what the team builds; judge engineering quality and culture; find a fitting role; verify expectations and process; read and discuss technical work.
- Key contexts of use: mobile discovery from shared articles, desktop deep reading, and quick job comparison on a commute.

## Information architecture

- Primary navigation: Stories, Company, Careers, About; search and theme controls remain utilities.
- Core routes/screens: editorial home, all stories, tags, company narrative, careers index, job detail, article detail, author profile.
- Content hierarchy: company proposition → featured work → topic/series discovery → working principles → open roles; article detail → author/series → article → related stories → restrained careers callout → comments.

## Design principles

- Evidence before slogans: lead with articles, practices, and role details instead of superlatives.
- Reading is the product: typography, spacing, and focus order take priority over ornamental UI.
- One clear next step: each section has at most one primary action.
- Editorial and hiring reinforce each other without sharing state or forcing a conversion.
- Tradeoffs: a smaller component vocabulary and mostly server-rendered UI are preferred over animation-heavy novelty.

## Visual language

- Color: warm paper and ink neutrals; a clear cobalt action color; a sparingly used acid-lime signal for hiring/status. Dark mode uses deep navy rather than pure black.
- Typography: Space Grotesk for Latin display character, Korean system sans for reliable Hangul, large but compact headlines, and a 65–72 character article measure.
- Spacing/layout rhythm: 4/8px base; generous 72–112px section gaps; asymmetrical 12-column desktop compositions; stacked mobile flow.
- Shape/radius/elevation: 12–24px radii, 1px borders, almost no drop shadows; cards feel editorial rather than dashboard-like.
- Motion: 160–240ms state transitions and the existing page transition only; honor reduced motion.
- Imagery/iconography: existing article and author images; simple inline SVG arrows and status marks; no new stock or copied brand illustration.

## Components

- Existing components to reuse: `Link`, `Image`, `Tag`, `ThemeSwitch`, `SearchButton`, `MobileNav`, `Comments`, `MDXComponents`, and the three article layouts.
- New/changed components: editorial hero, story card, section heading, company principle card, job card, career callout, article context/related stories, and accessible skip link.
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
- Empty: careers explains that no role is open and offers an email/contact path; lists state when no story matches.
- Error: invalid job/article slugs use `notFound`; invalid content fails validation before build.
- Success: external application links clearly indicate the destination; publishing success is a CLI/Git concern.
- Disabled: closed job actions render as non-interactive status, not a muted link.
- Offline/slow network: core text and navigation remain server-rendered; comments and optional analytics cannot block reading.

## Content voice

- Tone: direct Korean, concrete verbs, short declarative sentences, and respectful second person only where useful.
- Terminology: “글”, “팀”, “열린 포지션”, “지원하기”, “일하는 방식”; avoid “인재”, “가족”, and exaggerated “혁신”.
- Microcopy rules: state what happens after an action; label external application destinations; never imply a role is open when its content status is closed or draft.

## Implementation constraints

- Framework/styling system: Next.js App Router, React 19, Tailwind CSS 4, Contentlayer2 bridge, and MDX.
- Design-token constraints: extend existing Tailwind theme variables; do not add a second styling runtime or UI dependency.
- Performance constraints: mostly Server Components, local/static assets, no auto-playing media, no blocking comment script, and stable layout dimensions.
- Compatibility constraints: preserve all 65 `data/blog` paths/bytes, local `Transition` and `Youtube`, established article URLs, dark mode, static export fallback, and Node standalone readiness.
- Test/screenshot expectations: lint, typecheck, unit tests, build, route smoke, metadata/JSON-LD checks, keyboard/semantic checks, and 360/768/1280 visual inspection when a browser surface is available.

## Open questions

- [ ] Replace provisional “Moel Engineering” with the legal company name and production domain / owner: site owner / impact: metadata and copy only.
- [ ] Confirm the final application destination and recruiting contact / owner: recruiting / impact: job CTA only.
- [ ] Supply any approved company photography or illustration / owner: brand / impact: optional; launch does not depend on it.
