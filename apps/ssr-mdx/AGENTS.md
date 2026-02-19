# AGENTS.md

本文件为在此代码库中运行的 AI 代理提供指导。

## 项目概览

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (严格模式)
- **包管理器**: pnpm
- **样式**: Tailwind CSS v4 + shadcn/ui 组件
- **图标**: lucide-react

## 构建 / 代码检查 / 测试命令

### 开发
```bash
pnpm dev        # 启动开发服务器 (http://localhost:3000)
```

### 构建
```bash
pnpm build      # 生产环境构建
pnpm start      # 启动生产服务器
```

### 代码检查
```bash
pnpm lint       # 运行 ESLint
```

### 包体积分析
```bash
pnpm analyze        # 分析包体积
pnpm analyze:turbo  # 使用 Turbo 分析（实验性）
```

### 运行测试

**注意**: 已安装 Playwright (`@playwright/test`)，但目前没有测试用例。如需添加测试：

```bash
# 运行所有 Playwright 测试
npx playwright test

# 运行单个测试文件
npx playwright test tests/example.spec.ts

# 使用 UI 模式运行测试
npx playwright test --ui

# 在有头模式下运行测试
npx playwright test --headed

# 按名称运行特定测试
npx playwright test -g "测试名称"
```

## 代码风格指南

### TypeScript

- **启用严格模式** - 所有 TypeScript 严格检查都开启
- 当类型不明显时，为函数参数和返回值使用显式类型
- 使用 `type` 定义联合类型/接口，使用 `interface` 定义可能扩展的对象结构
- 使用 `import { type Foo }` 语法导入仅类型使用的导入

### 导入顺序

- 使用路径别名: `@/*` 映射到根目录 (例如 `@/components`, `@/lib/utils`)
- 导入顺序:
  1. React/Next 导入
  2. 外部库
  3. 路径别名导入 (`@/...`)
  4. 相对导入
- 示例:
  ```typescript
  import * as React from "react"
  import { useState } from "react"
  import { cn } from "@/lib/utils"
  import { Button } from "@/components/ui/button"
  import { SomeComponent } from "./some-component"
  ```

### 命名约定

- **组件**: PascalCase (例如 `Button.tsx`, `ScrollToTop.tsx`)
- **Hooks**: camelCase 并以 `use` 前缀开头 (例如 `useTheme`, `useMobileMenu`)
- **工具函数**: camelCase (例如 `cn`, `formatDate`)
- **文件**: 非组件文件使用 kebab-case (例如 `eslint.config.mjs`)

### 组件规范

- 通过 `components.json` 使用 shadcn/ui 约定:
  - UI 组件放在 `components/ui/`
  - 使用 `cn()` 工具函数合并 className
  - 使用 `cva` (class-variance-authority) 实现变体组件
  - 优先使用 Radix UI 原语
- 使用命名导出导出组件
- 为多态组件使用 `data-slot` 属性

### 错误处理

- 使用 Next.js 错误边界 (`error.tsx`) 处理路由级错误
- 使用 `next/navigation` 的 `notFound()` 处理 404 情况
- 切勿在错误消息中暴露敏感信息

### Tailwind CSS

- 使用 Tailwind CSS v4 配合 CSS 变量
- 遵循 shadcn/ui "new-york" 风格进行组件样式设计
- 使用 `cn()` 工具函数合并 Tailwind 类
- 自定义样式放在 `app/globals.css`

### React 模式

- 在 App Router 中默认使用 Server Components
- 仅在需要时添加 `'use client'` 指令（hooks、事件处理、浏览器 API）
- 使用 `next-themes` 进行主题管理，配合 `useTheme` hook
- 优先使用函数式组件和 hooks，而非类组件

### MDX

- MDX 内容存放在 `content/` 目录
- 使用 `next-mdx-remote` 渲染 MDX
- 支持 remark-gfm、rehype-pretty-code、rehype-slug、rehype-autolink-headings

### 文件组织

```
├── app/              # Next.js App Router 页面
├── components/       # React 组件
│   └── ui/           # shadcn/ui 组件
├── content/          # MDX 内容（文章等）
├── lib/              # 工具函数和辅助函数
├── public/           # 静态资源
└── docs/             # 文档
```

### ESLint

- 使用扁平配置 (`eslint.config.mjs`)
- 继承 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript`
- 提交前运行 `pnpm lint`

## 补充说明

- 目前未配置单元测试框架 - 可考虑添加 Vitest
- 使用 pnpm - 不要使用 npm/yarn
- 环境变量放在 `.env`（仅本地使用，切勿提交 secrets）
