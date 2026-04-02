# --- Stage 1: Build ---
FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable

WORKDIR /usr/src/app
COPY . .

# 1. 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 2. 构建依赖项及应用
RUN pnpm --filter "ssr-mdx^..." build
RUN pnpm --filter=ssr-mdx build

# 3. 运行 SourceMap 处理脚本
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
RUN node ./packages/sourcemap-cli/index.js ./apps/ssr-mdx/.next/static

# 3. 在该阶段处理静态资源拷贝
RUN cp -r apps/ssr-mdx/.next/static apps/ssr-mdx/.next/standalone/apps/ssr-mdx/.next/ && \
    mkdir -p apps/ssr-mdx/.next/standalone/apps/ssr-mdx/public && \
    cp -r apps/ssr-mdx/public/* apps/ssr-mdx/.next/standalone/apps/ssr-mdx/public/

# --- Stage 2: Runner ---
FROM node:24-slim AS runner
WORKDIR /app

COPY --from=build /usr/src/app/apps/ssr-mdx/.next/standalone ./

EXPOSE 3000

# 运行 standalone 模式下的 server.js
# 注意：在 Monorepo 中，路径通常是 apps/ssr-mdx/server.js
CMD ["node", "apps/ssr-mdx/server.js"]