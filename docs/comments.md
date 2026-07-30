# Comments Operations

## First-release provider

The first release uses Giscus behind `lib/comments/config.mjs`. Article routes and
content do not depend on the provider implementation. A complete configuration
requires:

- `NEXT_PUBLIC_GISCUS_REPO` (`owner/repository`);
- `NEXT_PUBLIC_GISCUS_REPOSITORY_ID`;
- `NEXT_PUBLIC_GISCUS_CATEGORY`;
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID`.

The repository must be public, GitHub Discussions must be enabled, the Giscus app
must be installed for the repository, and the configured category must accept
discussions. Readers need a GitHub account to comment. These are product
limitations, not application authentication.

Run `yarn comments:check` in the build/deploy pipeline. All variables unset means
comments are intentionally disabled. A partial or invalid configuration fails the
check. The browser receives no secret; Giscus identifiers are public configuration.

These four values must be available while Next.js builds the image because
`NEXT_PUBLIC_*` values are compiled into the browser bundle. `deploy/compose.yaml`
passes them as Docker build arguments. Copy `.env.example` to the deploy
platform's build environment, verify the repository/category values, and rebuild
the image after changing them; setting them only on an already-built container
does not enable comments.

## Thread identity and loading

- A post at `/blog/<slug>` maps to that stable pathname.
- Renaming a public slug changes its discussion key and therefore requires an
  explicit migration decision.
- The iframe is loaded only when the comment section approaches the viewport or
  the reader selects “댓글 불러오기”.
- Set `comments: false` in article frontmatter to remove the section and floating
  comment shortcut for that article.
- Missing global configuration renders no comment UI and never blocks article
  content.

## Staging moderation smoke

1. Deploy with the four complete Giscus variables.
2. Open a published test article and confirm the Network panel contacts only
   `https://giscus.app` for the comment embed.
3. Sign in with GitHub and create a clearly marked staging comment.
4. Open the configured GitHub Discussions category, hide/delete the comment, and
   reload the same article to confirm the same thread returns.
5. Verify a `comments: false` fixture and a deployment with all four variables
   unset.
6. Record repository, category, article pathname, release SHA, moderator, and
   outcome without copying comment content or credentials.

## Moderation

Moderators use GitHub Discussions to edit, hide, lock, or delete content and apply
repository-level conduct rules. Restrict repository administration separately
from site deployment. If abuse increases, lock the affected discussion or disable
comments on the article while preserving the article itself.

## Remark42 adapter contract

A future self-hosted adapter must accept the same normalized `/blog/<slug>` thread
identifier and expose only a client component selected by the provider boundary.
It must run as a separate service with its own authentication decision, persistent
volume, backup/restore test, moderation roles, rate limits, CSP origins, privacy
notice, and health check. Adding it must not change article URLs, write
`data/blog`, or introduce state into the Next.js web container.
