# AGENTS.md - 智能体编码指南

本文档为在此代码库中运行的智能体编码代理提供编码指南。

## 项目概览

- **包管理器**: pnpm (v10.29.3+)
- **Node.js**: >= 24.13.1
- **TypeScript**: 5.9.3+
- **Monorepo 结构**: pnpm 工作区，包含 `apps/*` 和 `packages/*`

## 构建 / 代码检查 / 测试命令

### 安装依赖
```bash
pnpm install                    # 安装所有依赖
pnpm install --frozen-lockfile  # 使用精确的 lockfile 安装
```

### 类型检查
```bash
pnpm tsc        # 运行 TypeScript 编译器
pnpm typecheck # tsc 的别名
```

### 构建
```bash
pnpm build                      # 构建所有包
pnpm --filter <package> build   # 构建指定包
```

### 测试
```bash
pnpm test             # 运行所有测试
pnpm test:watch       # 监听模式运行测试
pnpm test:coverage    # 运行带覆盖率的测试
pnpm vitest run src/path/to/test.spec.ts  # 运行单个测试文件
pnpm vitest run --grep "pattern"           # 运行匹配模式的测试
```

### 代码检查与格式化（Biome + cspell）
```bash
pnpm lint          # 运行 linter 检查
pnpm format        # 格式化代码（自动写入）
pnpm format:check  # 检查格式化（不修改文件）
pnpm check         # 综合检查（lint + 导入排序）
pnpm check:fix     # 综合检查并自动修复
pnpm spell         # 拼写检查
```

### 开发
```bash
pnpm dev                    # 启动开发服务器（每个应用）
pnpm dev --filter <app>     # 启动指定应用
pnpm clean                  # 清理 node_modules 和构建产物
```

## 代码风格指南

### TypeScript
- 使用严格模式 (`strict: true`)
- 避免使用 `any` - 不确定时使用 `unknown`
- 函数尽量使用显式返回类型

### 导入顺序
外部包 → 内部包 → 相对路径
```typescript
import { useState } from 'react'
import { Button } from '@monorepo/components'
import { formatDate } from '../utils/date'
import { localHelper } from './helper'
```

### 命名规范
- **文件**: 短横线命名 (`user-service.ts`) 或组件用帕斯卡命名 (`Button.tsx`)
- **组件**: 帕斯卡命名 (`UserProfile`)
- **函数/变量**: 驼峰命名 (`getUserData`)
- **常量**: 全大写下划线命名 (`MAX_RETRY_COUNT`)
- **接口/类型**: 帕斯卡命名 (`User`, `UserData`)

### 格式化
- 2 空格缩进，单引号，分号
- 多行对象/数组使用尾随逗号
- 最大行长度：100 字符
- 使用 Biome 进行格式化

### 错误处理
```typescript
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof SpecificErrorType) {
    // 处理特定错误
  } else if (error instanceof Error) {
    console.error('操作失败:', error.message)
  }
  throw error
}
// 推荐使用 Result 类型: type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
```

### 异步编程
- 使用 try/catch 处理 Promise 拒绝
- 使用 `Promise.all()` 并行处理操作
- 避免在循环中不必要的 `await`

### React/Next.js 组件规范
```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
function List<T>({ items, renderItem }: ListProps<T>) {
  return items.map(renderItem)
}
```

### 文件组织
```
apps/
  nextFrontend/src/
    app/         # Next.js App Router 页面
    components/ # 特性专用组件
    lib/        # 工具函数
    hooks/      # 自定义 React Hooks
packages/
  components/   # 共享 UI 组件
  utils/        # 共享工具函数
```

### 测试规范
- 测试文件放在源文件旁边 (`component.tsx` → `component.test.tsx`)
- 使用描述性的测试名称
- 遵循 AAA 模式：Arrange（准备）, Act（执行）, Assert（断言）
- Mock 外部依赖
- 测试成功和错误路径

### Git 规范
- 使用有意义的提交信息
- 保持提交原子性和专注性
- 提交前运行 lint 和 typecheck

### 依赖管理
- 将依赖添加到相应的工作区包
- 使用 `pnpm add <package> --filter <package>` 添加到指定包
- 使用工作区协议: `workspace:*`

## 环境变量
- 永不提交密钥
- 使用 `.env.local` 进行本地开发
- 在 `.env.example` 中记录所需环境变量
- 使用应用名称作为前缀: `NEXT_PUBLIC_*`, `BFF_*`

## 常见任务

### 添加新应用
1. 在 `apps/` 创建目录
2. 添加 `package.json` 和脚本
3. 配置 tsconfig 继承根配置

### 添加新包
1. 在 `packages/` 创建目录
2. 添加 `package.json`，名称为 `@monorepo/package-name`
3. 配置 TypeScript 用于库构建
4. 从 `index.ts` 导出公共 API

### 跨包运行命令
```bash
pnpm -r <command>                  # 在所有包中运行
pnpm --filter <name> <command>    # 在指定包中运行
```
