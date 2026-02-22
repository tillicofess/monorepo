'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function HeaderClient() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isBlog = pathname === '/blog' || pathname?.startsWith('/blog/');

  return (
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
  );
}
