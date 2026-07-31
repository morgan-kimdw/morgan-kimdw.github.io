# Operations Runbook

This project ships as an immutable Next.js standalone container for a single Node.js instance behind a NAS or Dokploy-style reverse proxy.

## Build Contract

- Runtime: Node.js `24.18.0`, Yarn `4.18.0`, `NODE_ENV=production`.
- Build command: `docker build --build-arg RELEASE_SHA=$(git rev-parse --short=12 HEAD) -t aegifold-technologies:$(git rev-parse --short=12 HEAD) .`
- Dependency install: `yarn install --immutable`.
- Runtime user: numeric non-root user `10001:10001`.
- Runtime filesystem: compatible with `read_only: true`; only `/tmp` and `/app/.next/cache` should be writable tmpfs mounts.
- Runtime process: one `node server.js` instance. Scale horizontally with multiple containers only after comment/session behavior is explicitly reviewed.
- Health endpoint: `/api/health` must return non-secret release identity and a 2xx status before traffic is routed.
- Release identity: pass `RELEASE_SHA` as both build arg and runtime env. Public client code only sees values intentionally baked with `NEXT_PUBLIC_`.
- Public Giscus identifiers: pass all four `NEXT_PUBLIC_GISCUS_*` values as build arguments when comments are enabled; they are not runtime-only settings.
- Secrets: inject through the deploy platform only. Do not bake `.env*`, credentials, tokens, private keys, or NAS paths into the image.

The Dockerfile keeps source files, `data/blog`, and writable content outside the runtime contract. Content publishing happens by producing a new image from Git, not by editing files inside the running container.

## Dokploy / Compose

Use `deploy/compose.yaml` as the baseline. In Dokploy, configure the service with:

- image or repository build context pointing at this repository;
- `RELEASE_SHA` set to the Git SHA being deployed;
- port `3000` exposed only to the internal proxy when possible;
- health check path `/api/health`;
- `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`, and tmpfs mounts for `/tmp` plus `/app/.next/cache`;
- `stop_grace_period: 30s` and `SIGTERM` shutdown.

Only one container should serve production traffic for the first release. If the NAS proxy supports blue/green deploys, start the new image, wait for health, shift traffic, then stop the old image.

## Reverse Proxy

TLS should terminate at the platform proxy, not inside the app container. Forward these headers:

- `Host`;
- `X-Forwarded-Host`;
- `X-Forwarded-Proto`;
- `X-Forwarded-For`;
- `X-Real-IP`.

Keep response buffering disabled or streaming-friendly for React/Next responses. Use a conservative request body limit such as `10MB` unless publishing uploads are added later. Apply edge rate limits before the Node server; start around `10r/s` per IP with burst capacity for static assets and tune from access logs.

Examples are provided in `deploy/caddy/Caddyfile` and `deploy/nginx/site.conf`. Replace `example.com` or `SITE_HOST` with the real hostname.

## Backup / Restore Inventory

Back up these inputs, not the container filesystem:

- Git repository including `data/blog`, `data/jobs`, `data/company.ts`, `public/static`, `docs`, and deployment files;
- deploy platform configuration: image tag, environment variables, domain routing, health checks, volume/tmpfs settings, and proxy rules;
- external comment provider configuration and moderation records;
- media stored outside Git, if any future upload provider is added;
- NAS scheduler or registry credentials used to pull images.

Canonical content should normally be committed before a release. Because local drafts may still be untracked, also capture a filesystem archive before maintenance:

```sh
tar -czf aegifold-content-backup.tgz data/blog data/jobs data/company.ts public/static
git bundle create aegifold-repository.bundle --all
```

Store the archive, Git bundle, deploy configuration export, and encrypted secret backup outside the NAS volume being protected. Never place plaintext `.env` files in the content archive.

Restore into an empty temporary directory first:

```sh
git clone aegifold-repository.bundle restored-site
tar -xzf aegifold-content-backup.tgz -C restored-site
cd restored-site
corepack enable
yarn install --immutable
yarn content:manifest
yarn build
```

Compare the restored manifest with the backup-time manifest, then rebuild or pull the matching image tag, restore deploy environment/proxy settings, and run `node scripts/container-smoke.mjs --url https://your-domain.example --release <sha>`.

## Rollback

Images are immutable. Roll back by redeploying the previous known-good image tag and verifying `/api/health`, `/`, `/blog`, `/search.json`, and `/feed.xml`.

Keep the existing static export fallback for at least two production releases. If the Node container path fails, build with `EXPORT=1 UNOPTIMIZED=1 yarn build` and serve `out/` from the NAS static server while the server runtime is repaired.

Next.js does not emit `headers()` rules into a static export. When using this fallback, reproduce the CSP, HSTS, referrer, permissions, frame, and MIME-sniffing headers from `next.config.js` at the NAS web server or reverse-proxy layer before routing public traffic.

## Smoke Test

For a running deployment:

```sh
node scripts/container-smoke.mjs --url https://your-domain.example --release <sha>
```

For a local image:

```sh
docker build --build-arg RELEASE_SHA=$(git rev-parse --short=12 HEAD) -t aegifold-technologies:smoke .
node scripts/container-smoke.mjs --image aegifold-technologies:smoke --release $(git rev-parse --short=12 HEAD)
```

The smoke test checks health, representative routes, static assets, search/feed JSON/XML, release identity, secret canary leakage, non-root user, read-only startup, and graceful container stop when Docker is used.
