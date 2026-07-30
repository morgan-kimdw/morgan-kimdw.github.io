# Publishing Workflow

This project uses an immutable production build and a Git-backed local CLI for blog publishing.
There is no browser CMS in the production app.

## Commands

```bash
yarn content:check --path data/blog/<folder>/<slug>.mdx
yarn content:check
yarn content:new --path data/blog/<folder>/<slug>.mdx --title "Draft title"
yarn content:publish --path data/blog/<folder>/<slug>.mdx
yarn content:new --path data/jobs/<slug>.mdx --title "Role title" \
  --apply-url "https://ats.example.com/role" --team "Engineering" --location "Seoul"
```

`content:new` and `content:publish` accept `--dry-run`. Publishing leaves a reviewable
working-tree diff by default. Add `--commit` to create a Lore-formatted commit containing
only the selected file. Add `--commit --push --remote origin --branch main` only after
review to push that commit; the protected branch or PR workflow then triggers the configured
Dokploy build.

Without `--path`, `content:check` scans both content roots. It reports malformed private
drafts as non-public warnings and exits non-zero only when malformed content is explicitly
public. Supplying `--path` always validates that selected file strictly.

## Rules

- The selected file must be one explicit `data/blog/**/*.mdx` or `data/jobs/*.mdx` path.
- New posts and roles are created only at the selected safe path and default to `draft: true`.
- Publishing only flips the selected file's `draft` frontmatter value to `false`.
- Publishing refuses to run when unrelated dirty files exist, so deployable content changes stay reviewable in Git.
- Validation rejects missing required fields, invalid dates or slugs, duplicate explicit slugs,
  unsupported job enums/application URLs, unsafe paths, and missing root-relative assets.
- Git commits and pushes are opt-in. A push requires an opt-in commit and targets only the
  configured remote and branch.
- Audit events are appended to `var/audit/publishing.jsonl` by default and include actor,
  path, commit/worktree state, action, outcome, and timestamp. Article body content is never
  copied into the audit log. Mount `var/audit` as external writable storage in production-like
  operations; the web application itself never writes it.

## Review and rollback

1. Run `content:check` for the selected file.
2. Run `content:publish --dry-run`, inspect its JSON, then run without `--dry-run`.
3. Review `git diff -- data/...`.
4. Use `--commit`; open a pull request or use the protected-branch workflow.
5. Roll back a bad publication by reverting that single publish commit. Never edit content in
   the running web container.

## CMS Decision

Keystatic and other browser-editing CMS paths are intentionally deferred. They need separate proof for safe MDX round-tripping, authentication, and server-side write permissions on the NAS deployment target. Until that proof exists, production remains immutable and publishing stays CLI-only.
