FROM node:24-slim AS base
ARG PNPM_VERSION=12.0.0-rc.6
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL https://get.pnpm.io/install.sh \
        | env PNPM_VERSION="$PNPM_VERSION" ENV=/root/.profile SHELL=/bin/sh sh - \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm build

FROM node:24-slim
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
