import Link from 'next/link';
import { CommandMenu } from '@/components/command/CommandMenu';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAllPosts } from '@/lib/mdx';
import { cn } from '@/lib/utils';
import { HeaderClient } from './HeaderClient';

export function Header() {
  const posts = getAllPosts();

  return (
    <header
      className={cn('sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2 pt-2')}
    >
      <div
        className="screen-line-before screen-line-after mx-auto flex h-12 items-center justify-between gap-2 border-x border-edge px-2 after:z-1 after:transition-[background-color] sm:gap-4 md:max-w-3xl"
        data-header-container
      >
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Blog</span>
          </Link>
          <HeaderClient />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <CommandMenu posts={posts} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
