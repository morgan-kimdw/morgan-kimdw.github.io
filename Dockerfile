# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.18.0
ARG YARN_VERSION=4.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

ARG YARN_VERSION
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    YARN_ENABLE_GLOBAL_CACHE=false
WORKDIR /app
RUN corepack enable && corepack prepare "yarn@${YARN_VERSION}" --activate

FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN yarn install --immutable

FROM base AS builder

ARG RELEASE_SHA
ARG NEXT_PUBLIC_GISCUS_REPO
ARG NEXT_PUBLIC_GISCUS_REPOSITORY_ID
ARG NEXT_PUBLIC_GISCUS_CATEGORY
ARG NEXT_PUBLIC_GISCUS_CATEGORY_ID
ENV NODE_ENV=production \
    RELEASE_SHA=${RELEASE_SHA} \
    NEXT_PUBLIC_RELEASE_SHA=${RELEASE_SHA} \
    NEXT_PUBLIC_GISCUS_REPO=${NEXT_PUBLIC_GISCUS_REPO} \
    NEXT_PUBLIC_GISCUS_REPOSITORY_ID=${NEXT_PUBLIC_GISCUS_REPOSITORY_ID} \
    NEXT_PUBLIC_GISCUS_CATEGORY=${NEXT_PUBLIC_GISCUS_CATEGORY} \
    NEXT_PUBLIC_GISCUS_CATEGORY_ID=${NEXT_PUBLIC_GISCUS_CATEGORY_ID}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=deps /app/package.json /app/yarn.lock ./
COPY . .
RUN test -n "${RELEASE_SHA}"
RUN yarn build

FROM node:${NODE_VERSION}-bookworm-slim AS runner

ARG RELEASE_SHA
ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    RELEASE_SHA=${RELEASE_SHA} \
    NEXT_PUBLIC_RELEASE_SHA=${RELEASE_SHA} \
    TMPDIR=/tmp
WORKDIR /app

RUN groupadd --system --gid 10001 nextjs \
    && useradd --system --uid 10001 --gid nextjs --home-dir /app --shell /usr/sbin/nologin nextjs \
    && mkdir -p /app/.next/cache /tmp/next-cache \
    && chown -R nextjs:nextjs /app /tmp/next-cache

COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./

USER 10001:10001
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
