'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandMenu } from '@/components/command/CommandMenu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface Post {
  title: string;
  slug: string;
  date: string;
  author?: string;
}

interface HeaderProps {
  posts: Post[];
}

export function Header({ posts }: HeaderProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isBlog = pathname === '/blog' || pathname?.startsWith('/blog/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6">
        <div className="mr-4 flex">
          <Link
            href="/"
            className={cn(
              'mr-6 flex items-center space-x-2 transition-colors',
              isHome ? 'text-foreground' : 'text-foreground/60 hover:text-foreground',
            )}
          >
            <span className="font-bold">Blog</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-foreground',
                isHome ? 'text-foreground font-medium' : 'text-foreground/60',
              )}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={cn(
                'transition-colors hover:text-foreground',
                isBlog ? 'text-foreground font-medium' : 'text-foreground/60',
              )}
            >
              Articles
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <CommandMenu posts={posts} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
