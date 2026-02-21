'use client';

import { Terminal } from 'lucide-react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';

interface PackageManagerTabsProps {
  command: string;
  args?: string;
}

export default function PackageManagerTabs({ command, args = '' }: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = React.useState('npm');

  const getCommand = (pm: string) => {
    const cleanArgs = args.trim();

    if (command === 'install' || command === 'add') {
      switch (pm) {
        case 'npm':
          return `npm install ${cleanArgs}`;
        case 'pnpm':
          return `pnpm add ${cleanArgs}`;
        case 'yarn':
          return `yarn add ${cleanArgs}`;
        case 'bun':
          return `bun add ${cleanArgs}`;
      }
    }

    if (command === 'create') {
      switch (pm) {
        case 'npm':
          return `npm create ${cleanArgs}`;
        case 'pnpm':
          return `pnpm create ${cleanArgs}`;
        case 'yarn':
          return `yarn create ${cleanArgs}`;
        case 'bun':
          return `bun create ${cleanArgs}`;
      }
    }

    if (command === 'dlx' || command === 'exec') {
      switch (pm) {
        case 'npm':
          return `npx ${cleanArgs}`;
        case 'pnpm':
          return `pnpm dlx ${cleanArgs}`;
        case 'yarn':
          return `npx ${cleanArgs}`;
        case 'bun':
          return `bunx ${cleanArgs}`;
      }
    }

    if (command === 'run') {
      switch (pm) {
        case 'npm':
          return `npm run ${cleanArgs}`;
        case 'pnpm':
          return `pnpm run ${cleanArgs}`;
        case 'yarn':
          return `yarn run ${cleanArgs}`;
        case 'bun':
          return `bun run ${cleanArgs}`;
      }
    }

    return `${pm} ${command} ${cleanArgs}`;
  };

  const activeCommand = getCommand(activeTab);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-md">
      <Tabs defaultValue="npm" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
          <div className="flex items-center gap-4">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <TabsList className="bg-transparent p-0 h-auto gap-1">
              {['npm', 'pnpm', 'yarn', 'bun'].map((pm) => (
                <TabsTrigger
                  key={pm}
                  value={pm}
                  className={cn(
                    'rounded-none border-b-2 border-transparent bg-transparent px-2 py-1 font-mono text-xs text-zinc-400 hover:text-zinc-200 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none',
                  )}
                >
                  {pm}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <CopyButton
            value={activeCommand}
            className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
          />
        </div>

        <div className="p-4 bg-zinc-950">
          <div className="font-mono text-sm text-zinc-100 whitespace-pre-wrap break-all">
            <span className="text-zinc-500 mr-2 select-none">$</span>
            {activeCommand}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
