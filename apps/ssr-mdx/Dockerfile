FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app
# 拷贝全量代码处理 Monorepo 依赖
COPY . .

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter=ssr-mdx build

# --- Stage 2: Runner ---
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone 默认监听 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=build /usr/src/app/apps/ssr-mdx/.next/standalone ./

EXPOSE 3000

# 运行 standalone 模式下的 server.js
# 注意：在 Monorepo 中，路径通常是 apps/ssr-mdx/server.js
CMD ["node", "apps/ssr-mdx/server.js"]