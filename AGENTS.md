# AGENTS.md

This file gives coding agents the repo-specific guidance they need to work safely and consistently in this monorepo.

## Scope

- Applies to the whole repository unless a deeper `AGENTS.md` overrides it.
- `apps/ssr-mdx/AGENTS.md` already exists and is more specific for that app.
- No Cursor rules were found in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions were found in `.github/copilot-instructions.md`.

## Repository Snapshot

- Package manager: `pnpm`.
- Runtime baseline: Node `>=24.13.1`.
- Top-level language/tooling: TypeScript, Biome, Git hooks.
- Monorepo areas: `apps/` and `packages/`.
- Root package is ESM (`"type": "module"`).

## Main Scripts

Run these from the repo root.

```bash
pnpm format
pnpm lint
pnpm check
```

- `pnpm format` formats `apps/` and `packages/` with Biome.
- `pnpm lint` runs Biome lint with writes enabled.
- `pnpm check` runs Biome check with writes enabled.

## Package Commands

### `apps/ssr-mdx`

```bash
pnpm --filter @monorepo/ssr-mdx dev
pnpm --filter @monorepo/ssr-mdx build
pnpm --filter @monorepo/ssr-mdx start
pnpm --filter @monorepo/ssr-mdx analyze
pnpm --filter @monorepo/ssr-mdx analyze:turbo
```

- This app uses Next.js App Router.
- Playwright is installed, but there is no committed test suite yet.

### `apps/mdx-backend`

```bash
pnpm --filter @monorepo/mdx-backend dev
pnpm --filter @monorepo/mdx-backend build
pnpm --filter @monorepo/mdx-backend preview
```

- The build runs `tsc -b && vite build`.

### `apps/backend`

```bash
pnpm --filter @monorepo/backend start:dev
pnpm --filter @monorepo/backend start:prod
pnpm --filter @monorepo/backend test
```

- The `test` script currently exits with an error because no tests are defined.

### `packages/utils`

```bash
pnpm --filter @monorepo/utils build
pnpm --filter @monorepo/utils dev
pnpm --filter @monorepo/utils typecheck
pnpm --filter @monorepo/utils lint
pnpm --filter @monorepo/utils lint:fix
```

### `packages/monitor`

```bash
pnpm --filter @monorepo/monitor build
pnpm --filter @monorepo/monitor dev
pnpm --filter @monorepo/monitor typecheck
pnpm --filter @monorepo/monitor clean
```

## Single Test Guidance

- There is no shared test runner wired up at the repo root.
- For Playwright tests in `apps/ssr-mdx`, run a single file with:

```bash
pnpm exec playwright test tests/example.spec.ts
```

- Run a single Playwright test by title with:

```bash
pnpm exec playwright test -g "test name"
```

- If you add a new package-specific test runner, prefer the narrowest command that targets one file or one test name.
- If a package exposes its own `test` script later, use `pnpm --filter <pkg> test -- <args>` for focused runs.

## Formatting Rules

- Use Biome formatting conventions everywhere.
- Indentation: tabs.
- Line endings: LF.
- Max line width: 80 columns when practical.
- JavaScript/TypeScript strings: double quotes.
- Semicolons: keep them.
- Trailing commas: keep them where Biome applies them.
- Let Biome organize imports rather than hand-editing order.

## TypeScript Rules

- Keep `strict`-style typing intact; do not relax compiler settings without a strong reason.
- Prefer explicit types for public functions, props, and exported APIs when inference is not obvious.
- Use `type` for unions, aliases, and most object shapes.
- Use `interface` only when extension or declaration merging is useful.
- Use `import type` or `import { type X }` for type-only imports.
- Avoid `any`; if it is unavoidable, isolate it and explain why in code review notes.
- Respect `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noUncheckedSideEffectImports`.

## Import Rules

- Prefer absolute aliases when the package defines them:
  - `apps/ssr-mdx`: `@/*`
  - `apps/mdx-backend`: `@/*` -> `./src/*`
- Keep imports grouped as:
  1. Node/React/Next built-ins
  2. External packages
  3. Workspace aliases
  4. Relative imports
- Use relative imports only for nearby files inside the same feature area.
- Do not leave unused imports; Biome should remove or sort them.

## Naming Conventions

- Components: PascalCase file names and exports, such as `Button.tsx`.
- Hooks: camelCase with a `use` prefix, such as `useTheme`.
- Utilities: camelCase, such as `formatDate` or `cn`.
- Non-component files: kebab-case where practical.
- Keep exported names descriptive and stable.

## React And Next.js Rules

- In `apps/ssr-mdx`, default to Server Components.
- Add `'use client'` only when a component needs hooks, browser APIs, or event handlers.
- Prefer function components and hooks over class components.
- Use `next/navigation` utilities such as `notFound()` and route-level `error.tsx` where appropriate.
- Keep client bundles small; move data shaping and heavy logic server-side when possible.

## Tailwind And UI Rules

- `apps/ssr-mdx` uses Tailwind CSS v4 and shadcn/ui with the `new-york` style.
- Keep shared visual tokens in CSS variables and `app/globals.css`.
- Use `cn()` for conditional class composition.
- Prefer Radix primitives and shadcn/ui patterns for interactive components.
- When adding new UI, match the existing design language instead of introducing a new one casually.

## Backend And Service Rules

- Keep Express handlers small and focused.
- Validate inputs near the route boundary.
- Return structured errors; do not expose secrets, tokens, or internal stack traces.
- Prefer async/await with clear error propagation.
- Handle env files carefully; never commit secrets from `.env` files.

## Error Handling Rules

- Use framework-native error boundaries in Next apps.
- In API code, convert expected failures into explicit HTTP responses.
- Reserve thrown exceptions for truly unexpected states.
- Write error messages that are actionable but not sensitive.

## File And Folder Guidance

- Keep app code in `app/`, reusable UI in `components/`, helper code in `lib/`, and static assets in `public/`.
- Keep MDX content in `content/` where the app expects it.
- Keep package source under `src/` when the package already uses that layout.
- Do not move files around unless the change clearly benefits maintainability.

## Working Practices

- Make the smallest change that solves the task.
- Preserve unrelated user changes in a dirty worktree.
- Prefer `apply_patch` for direct single-file edits.
- Run the narrowest useful verification command after making changes.
- If a package has no test suite, say so instead of inventing one.

## When In Doubt

- Read the nearest package `package.json`, `tsconfig.json`, and any deeper `AGENTS.md` first.
- Follow existing repository conventions over generic preferences.
- If you add new tooling, document the command here only if it is likely to matter for future agents.
