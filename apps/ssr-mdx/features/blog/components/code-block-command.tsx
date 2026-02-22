"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import type { NpmCommands } from "@/types/unist"
import { CopyButton } from "./copy-button"
import { usePackageManager } from "@/hooks/use-package-manager"

export function CodeBlockCommand({
  __pnpm__,
  __yarn__,
  __npm__,
  __bun__,
}: NpmCommands) {
  // 🔥 全局同步状态（自动持久化）
  const [packageManager, setPackageManager] = usePackageManager()

  const tabs = {
    pnpm: __pnpm__,
    yarn: __yarn__,
    npm: __npm__,
    bun: __bun__,
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-code">
      <Tabs
        className="gap-0"
        value={packageManager}
        onValueChange={(value) =>
          setPackageManager(value as typeof packageManager)
        }
      >
        <div className="px-4 shadow-[inset_0_-1px_0_0] shadow-border">
          <TabsList className="h-10 rounded-none bg-transparent p-0 dark:bg-transparent">
            {Object.keys(tabs).map((key) => (
              <TabsTrigger
                key={key}
                className="h-7 rounded-lg p-0 px-2 font-mono"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Object.entries(tabs).map(([key, value]) => (
          <TabsContent key={key} value={key}>
            <pre>
              <code
                data-slot="code-block"
                data-language="bash"
                className="font-mono text-sm leading-none text-muted-foreground"
              >
                <span className="select-none">$ </span>
                {value}
              </code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>

      <CopyButton
        className="absolute top-2 right-2 z-10"
        value={tabs[packageManager] || ""}
      />
    </div>
  )
}