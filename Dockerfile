FROM platformatic/node-caged:26-slim AS base
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends ca-certificates \
    && update-ca-certificates && rm -rf /var/lib/apt/lists/*
ARG PNPM_VERSION=12.0.0-rc.10
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV npm_config_node_gyp=/usr/local/lib/node_modules/node-gyp/bin/node-gyp.js
# better-sqlite3 must match the pointer-compressed runtime, not a stock prebuild.
ENV npm_config_build_from_source=true npm_config_nodedir=/usr/local npm_config_jobs=2
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        g++ \
        make \
        python3 \
    && npm install -g node-gyp@11.5.0 \
    && curl -fsSL https://get.pnpm.io/install.sh \
        | env PNPM_VERSION="$PNPM_VERSION" ENV=/root/.profile SHELL=/bin/sh sh - \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile && pnpm rebuild better-sqlite3

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm build

FROM platformatic/node-caged:26-slim
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends ca-certificates \
    && update-ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/seed ./seed
RUN mkdir -p data
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
