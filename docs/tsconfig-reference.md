# TypeScript 配置字段详解

本文档详细解释本项目 `tsconfig.json` 中各配置字段的作用。

## 当前配置概览

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "types": [],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "verbatimModuleSyntax": false,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", "coverage"]
}
```

---

## compilerOptions 详解

### target

```json
"target": "ESNext"
```

指定编译输出的 JavaScript 版本。

- `ESNext`：编译为当前 Node.js/浏览器支持的最新 ES 特性

---

### lib

```json
"lib": ["ESNext"]
```

包含的类型声明文件。

- `ESNext`：包含最新的 ES 标准库类型定义

---

### types

```json
"types": []
```

指定要包含的类型声明包。

- 空数组：不自动引入任何 @types 包
- 需要手动在具体项目中添加需要的类型，如 `["node", "react"]`

---

### module

```json
"module": "ESNext"
```

指定模块系统。

- `ESNext`：使用最新的 ES 模块语法（import/export）

---

### moduleResolution

```json
"moduleResolution": "bundler"
```

模块解析策略。

- `bundler`：适用于现代打包工具（Vite、Rollup、esbuild、Next.js）
- 不解析 node_modules 中的模块查找，会使用打包工具的解析逻辑

---

### declaration

```json
"declaration": true
```

生成 `.d.ts` 类型声明文件。

- 用于库发布，让其他项目消费时获得类型提示

---

### declaration
"declarationMap": true
```

生成Map

```json声明文件的 Source Map。

- 便于在 IDE 中从 `.d.ts` 跳转到源码
- 配合 `declaration` 使用

---

### sourceMap

```json
"sourceMap": true
```

生成 JavaScript 的 Source Map。

- 便于调试，浏览器 DevTools 中可查看原始 TypeScript 代码

---

### noUncheckedIndexedAccess

```json
"noUncheckedIndexedAccess": true
```

数组和元组索引访问返回 `T | undefined`。

```typescript
const arr = [1, 2, 3]
const x = arr[0] // 类型为 number | undefined，必须处理 undefined 情况

interface Obj {
  [key: string]: string
}
const o: Obj = { a: '1' }
const v = o['a'] // 类型为 string | undefined
```

---

### exactOptionalPropertyTypes

```json
"exactOptionalPropertyTypes": true
```

严格处理可选属性。

```typescript
interface User {
  name?: string
}

const user: User = {}

// 错误：不能将 undefined 赋值给可选属性
user.name = undefined

// 正确：必须使用显式值
user.name = 'John'
```

---

### strict

```json
"strict": true
```

启用所有严格类型检查。

开启此选项等同于同时开启：
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`

**推荐**：始终保持开启

---

### verbatimModuleSyntax

```json
"verbatimModuleSyntax": false
```

是否要求显式使用 `import type` 和 `import { type }`。

- `false`：允许混合导入，TypeScript 自动处理类型擦除
- `true`：必须区分 `import type { T }` 和 `import { T }`

---

### isolatedModules

```json
"isolatedModules": true
```

确保每个文件都可以独立编译。

- 防止跨文件的类型依赖影响编译
- 与打包工具的增量编译兼容

---

### noUncheckedSideEffectImports

```json
"noUncheckedSideEffectImports": true
```

检查带有副作用的导入。

```typescript
// 如果只导入类型，必须使用 import type
import { type SomeType } from 'module' // 正确
import { SomeType } from 'module'      // 如果 SomeType 只是类型，会有警告
```

---

### moduleDetection

```json
"moduleDetection": "force"
```

模块检测策略。

| 值 | 说明 |
|---|---|
| `auto` | 只有包含 import/export 的文件才算模块 |
| `force` | 所有文件都强制视为模块 |

- `force` 可以避免一些全局类型污染问题

---

### skipLibCheck

```json
"skipLibCheck": true
```

跳过库文件的类型检查。

- 显著提升编译速度
- 避免第三方库类型定义错误导致的编译失败

---

## 顶层配置

### exclude

```json
"exclude": ["node_modules", "dist", "build", ".next", "coverage"]
```

指定要从编译中排除的文件或目录。

| 目录 | 说明 |
|------|------|
| node_modules | 第三方依赖 |
| dist | 构建输出 |
| build | 构建输出 |
| .next | Next.js 输出 |
| coverage | 测试覆盖率报告 |

---

## 常用命令

```bash
# 类型检查（不生成文件）
tsc --noEmit

# 生成声明文件
tsc --declaration --emitDeclarationOnly

# 监听模式
tsc --watch

# 指定配置文件
tsc -p tsconfig.build.json
```

---

## 配置组合建议

本项目的配置适合：

- **库/包开发**：`declaration` + `declarationMap` 用于生成类型
- **应用开发**：可设置 `noEmit: true` 仅做类型检查
- **Monorepo**：作为基础配置被其他项目继承
