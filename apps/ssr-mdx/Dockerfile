FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app
# 拷贝全量代码处理 Monorepo 依赖
COPY . .

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 先构建所有被依赖的 package，确保 ssr-mdx 的依赖都被正确构建
RUN pnpm --filter "ssr-mdx^..." build

# 构建 ssr-mdx 应用，生成 standalone 输出
RUN pnpm --filter=ssr-mdx build

# --- Stage 2: Runner ---
FROM node:24-slim AS runner
WORKDIR /app

COPY --from=build /usr/src/app/apps/ssr-mdx/.next/standalone ./

EXPOSE 3000

# 运行 standalone 模式下的 server.js
# 注意：在 Monorepo 中，路径通常是 apps/ssr-mdx/server.js
CMD ["node", "apps/ssr-mdx/server.js"]