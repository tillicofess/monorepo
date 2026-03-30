FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter=@monorepo/backend --prod deploy /pruned

FROM base AS runner
WORKDIR /app
COPY --from=build /pruned .

EXPOSE 4000

CMD ["node", "index.js"]
