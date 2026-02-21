'use client';

import { ExternalLink, FileText, Home, Moon, Search, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import type { Post } from '@/features/blog/types/post';

interface CommandMenuProps {
  posts: Post[];
}

export function CommandMenu({ posts }: CommandMenuProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="hidden sm:inline-flex items-center gap-1">
          <Search className="h-4 w-4" />
          Search
        </span>
        <span className="sm:hidden">
          <Search className="h-4 w-4" />
        </span>
        <CommandShortcut className="ml-2 hidden sm:inline-flex">⌘K</CommandShortcut>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/blog'))}>
              <FileText className="mr-2 h-4 w-4" />
              Blog
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Articles">
            {posts.map((post) => (
              <CommandItem
                key={post.slug}
                onSelect={() => runCommand(() => router.push(`/blog/${post.slug}`))}
              >
                <FileText className="mr-2 h-4 w-4" />
                {post.metadata.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className="mr-2 h-4 w-4" />
              Light Theme
              {theme === 'light' && <CommandShortcut>Active</CommandShortcut>}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark Theme
              {theme === 'dark' && <CommandShortcut>Active</CommandShortcut>}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Links">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                window.open('https://github.com', '_blank');
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              GitHub
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
