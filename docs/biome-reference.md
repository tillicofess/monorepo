# Biome 配置详解

本文档介绍本项目使用的 Biome 配置，用于替代 Prettier 和 ESLint。

## 配置文件

项目根目录的 `biome.json` 包含所有配置。

## 当前配置

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "ignore": ["node_modules/", "dist/", "build/", ".next/", "coverage/", ".git/"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "trailingCommas": "es5"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "off"
      },
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

---

## 字段详解

### $schema

```json
"$schema": "https://biomejs.dev/schemas/2.4.0/schema.json"
```

JSON Schema URL，用于 IDE 自动补全和校验。

---

### vcs

版本控制相关配置。

| 字段 | 值 | 说明 |
|------|-----|------|
| enabled | true | 启用 VCS 集成 |
| clientKind | git | 使用 Git |
| useIgnoreFile | true | 读取 .gitignore |

---

### files

文件过滤配置。

| 字段 | 值 | 说明 |
|------|-----|------|
| ignoreUnknown | true | 忽略未知类型文件 |
| ignore | 数组 | 忽略的目录/文件 |

---

### formatter

代码格式化配置。

| 字段 | 值 | 说明 |
|------|-----|------|
| enabled | true | 启用格式化 |
| indentStyle | space | 使用空格缩进 |
| indentWidth | 2 | 缩进 2 空格 |
| lineWidth | 100 | 最大行长度 100 |
| trailingCommas | es5 | ES5 风格的尾随逗号 |

---

### linter

代码检查配置。

| 字段 | 值 | 说明 |
|------|-----|------|
| enabled | true | 启用 linter |
| recommended | true | 启用推荐规则 |

#### 自定义规则

```json
"rules": {
  "complexity": {
    "noForEach": "off"
  },
  "suspicious": {
    "noExplicitAny": "off"
  }
}
```

- `noForEach`: 关闭禁止使用 `forEach` 的规则
- `noExplicitAny`: 关闭禁止隐式 `any` 的规则（由 TypeScript strict 模式处理）

---

### javascript

JavaScript 特定格式化配置。

| 字段 | 值 | 说明 |
|------|-----|------|
| quoteStyle | single | 单引号 |
| semicolons | always | 总是使用分号 |
| trailingCommas | es5 | ES5 风格尾随逗号 |

---

### assist

代码辅助功能。

```json
"assist": {
  "enabled": true,
  "actions": {
    "source": {
      "organizeImports": "on"
    }
  }
}
```

- `organizeImports`: 自动排序导入语句

---

## 使用命令

```bash
# 仅运行 linter 检查
pnpm lint

# 格式化代码（自动写入）
pnpm format

# 检查格式（不修改）
pnpm format:check

# 综合检查（lint + organizeImports）
pnpm check

# 综合检查并自动修复
pnpm check:fix
```

| 命令 | 说明 |
|------|------|
| `biome lint` | 仅检查代码问题 |
| `biome format` | 格式化代码 |
| `biome check` | lint + 导入排序 |
| `biome --write` | 自动修复 |

---

## 与 Prettier/ESLint 对比

| 功能 | Prettier | ESLint | Biome |
|------|----------|--------|-------|
| 代码格式化 | ✅ | ❌ | ✅ |
| 代码检查 | ❌ | ✅ | ✅ |
| 导入排序 | ❌ | ✅ (import) | ✅ |
| 速度 | 快 | 慢 | 最快 |
| 配置 | 少 | 多 | 中 |

---

## 常用规则分类

### complexity（复杂度）

- `noForEach`: 禁止使用 `forEach`
- `noStaticOnlyClass`: 禁止只有静态方法的类
- `noBannedTypes`: 禁止使用某些类型

### correctness（正确性）

- `noUnusedVariables`: 禁止未使用变量
- `noUnusedImports`: 禁止未使用导入
- `noImplicitAnyLet`: 禁止隐式 any 的 let

### nursery（实验性）

- 新的规则集合，需要手动启用

### security（安全性）

- `noDangerouslySetInnerHtml`: 禁止 dangerouslySetInnerHTML
- `noGlobalEval`: 禁止 eval

### style（风格）

- `useBlockStatements`: 强制使用块语句
- `useShorthandArrayType`: 使用数组类型简写

### suspicious（可疑）

- `noExplicitAny`: 禁止隐式 any
- `noShadowRestrictedNames`: 禁止遮蔽受限名称
- `noArrayIndexKey`: 禁止使用数组索引作为 key
