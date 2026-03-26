# AGENTS.md

本文档为在此代码库中运行的 AI 代理提供指导。

## 项目概览

- **架构**: pnpm monorepo
- **包管理器**: pnpm (必须使用，不要使用 npm/yarn)
- **代码检查**: Biome
- **语言**: TypeScript (严格模式)
- **Node 版本**: >= 24.13.1
- **pnpm 版本**: >= 10.29.3

## 项目结构

```
├── apps/
│   ├── ssr-mdx/        # Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui
│   ├── mdx-backend/    # Vite + React + Ant Design
│   └── backend/       # Express.js
├── packages/
│   ├── utils/         # 通用工具函数 (tsup 构建)
│   └── monitor/       # 前端监控 SDK (Rollup 构建)
└── pnpm-workspace.yaml
```

## 常用命令

### 根目录命令 (整个 monorepo)

```bash
pnpm install              # 安装所有依赖
pnpm format              # 运行 Biome 格式化
pnpm lint                # 运行 Biome Lint 检查
pnpm check               # 运行 Biome 完整检查 (格式化 + Lint + import 排序)
pnpm commit              # 使用 cz-git 提交 git commit
```

### apps/ssr-mdx (Next.js 前端)

```bash
cd apps/ssr-mdx
pnpm dev                 # 启动开发服务器 (http://localhost:3000)
pnpm build               # 生产环境构建
pnpm start               # 启动生产服务器
pnpm analyze             # 分析包体积
pnpm analyze:turbo        # 使用 Turbo 分析（实验性）

# 测试 (使用 Playwright)
npx playwright test                          # 运行所有测试
npx playwright test tests/example.spec.ts   # 运行单个测试文件
npx playwright test --ui                     # UI 模式
npx playwright test --headed                 # 有头模式
npx playwright test -g "测试名称"            # 按名称运行特定测试
```

### apps/mdx-backend (React + Vite)

```bash
cd apps/mdx-backend
pnpm dev               # 启动开发服务器
pnpm build             # TypeScript 编译 + Vite 构建
pnpm preview           # 预览构建结果
```

### apps/backend (Express)

```bash
cd apps/backend
pnpm start:dev         # 开发环境启动 (读取 .env)
pnpm start:prod        # 生产环境启动 (读取 .env.production)
```

### packages/utils

```bash
cd packages/utils
pnpm build             # 构建为 cjs 和 esm 格式
pnpm dev               # 监听模式构建
pnpm typecheck         # TypeScript 类型检查
pnpm lint              # Biome 检查
pnpm lint:fix          # Biome 自动修复
```

### packages/monitor

```bash
cd packages/monitor
pnpm build             # Rollup 构建 (cjs + esm + umd)
pnpm clean             # 清理 dist 目录
pnpm dev               # 监听模式构建
pnpm typecheck         # TypeScript 类型检查
```

## 代码风格指南

### Biome 配置

项目使用 Biome 进行代码格式化和 Lint 检查，配置位于根目录 `biome.json`:
- **缩进**: Tab (2 空格)
- **行宽**: 80 字符
- **引号**: 双引号 (JSX 使用双引号)
- **分号**: 始终使用分号
- **尾随逗号**: 所有多行结构

保存文件时自动运行格式化 (VSCode 设置 `editor.codeActionsOnSave`):
```bash
pnpm check             # 完整检查 (格式化 + Lint + import 排序)
```

### TypeScript

- 启用严格模式
- 函数参数和返回值使用显式类型标注
- 使用 `type` 定义联合类型/接口，使用 `interface` 定义可扩展对象
- 使用 `import { type Foo }` 语法导入仅类型使用的导入

### 导入顺序

在 `apps/ssr-mdx` 中使用路径别名 `@/*`:
```typescript
// 顺序: React/Next -> 外部库 -> 路径别名 -> 相对导入
import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SomeComponent } from "./some-component"
```

### 命名约定

- **组件文件**: PascalCase (例如 `Button.tsx`, `ScrollToTop.tsx`)
- **Hooks**: camelCase，以 `use` 开头 (例如 `useTheme`, `useMobileMenu`)
- **工具函数**: camelCase (例如 `cn`, `formatDate`)
- **非组件文件**: kebab-case (例如 `eslint.config.mjs`)

### React 开发规范

**apps/ssr-mdx (Next.js App Router)**:
- 默认使用 Server Components
- 仅在需要时添加 `'use client'` 指令
- 使用 `next-themes` + `useTheme` hook 进行主题管理
- 优先使用函数式组件和 hooks

**apps/mdx-backend (React + Vite)**:
- 使用 React Router 进行路由管理
- 使用 Zustand 进行状态管理
- 使用 Ant Design 组件库

### 组件规范 (shadcn/ui)

- UI 组件放在 `components/ui/`
- 使用 `cn()` (tailwind-merge + clsx) 合并 className
- 使用 `cva` (class-variance-authority) 实现变体组件
- 优先使用 Radix UI 原语
- 使用命名导出
- 为多态组件使用 `data-slot` 属性

### Tailwind CSS

- 使用 Tailwind CSS v4 配合 CSS 变量
- 使用 `cn()` 工具函数合并 Tailwind 类
- 自定义样式放在 `app/globals.css`
- 遵循 shadcn/ui "new-york" 风格

### MDX (apps/ssr-mdx)

- MDX 内容存放在 `content/` 目录
- 使用 `next-mdx-remote` 渲染
- 支持: remark-gfm, rehype-pretty-code, rehype-slug, rehype-autolink-headings

### 错误处理

- Next.js 使用 `error.tsx` 错误边界
- 使用 `next/navigation` 的 `notFound()` 处理 404
- 切勿在错误消息中暴露敏感信息
- Express 后端使用 try-catch 中间件处理异步错误

### Git 提交

```bash
pnpm commit             # 使用 cz-git 交互式提交
```

提交规范遵循 `@commitlint/config-conventional`:
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具变动

## 环境变量

- 本地环境变量放在 `.env` 文件
- 切勿提交 secrets 到仓库
- 使用 `.env.example` 记录必需的环境变量

## 注意事项

- 所有变更提交前运行 `pnpm check` 确保代码质量
- 使用 pnpm workspace 依赖管理，避免手动修改 node_modules
- 使用 catalogs (pnpm-workspace.yaml) 管理共享依赖版本
