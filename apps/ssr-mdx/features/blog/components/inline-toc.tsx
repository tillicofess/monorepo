'use client';

import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { cn } from '@/lib/utils';

interface TocItem {
  title: ReactNode;
  url: string;
  depth: number;
}

interface InlineTocProps {
  toc: TocItem[];
  className?: string;
}

const HEADER_OFFSET = 80;

export function InlineToc({ toc, className }: InlineTocProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -80% 0%' },
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.url);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      toc.forEach((item) => {
        const element = document.getElementById(item.url);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [toc]);

  if (toc.length === 0) return null;

  const handleClick = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - HEADER_OFFSET,
        behavior: 'smooth',
      });
    }
    setActiveId(slug);
  };

  const getIndentClass = (depth: number) => {
    switch (depth) {
      case 1:
        return 'font-medium';
      case 2:
        return 'pl-3';
      case 3:
        return 'pl-6';
      default:
        return '';
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('w-full', className)}>
      <div className="rounded-xl border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 rounded-xl transition-colors">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">On this page</span>
          </div>
          {open ? (
            <X className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Menu className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="border-t px-4 pb-4">
            <ul className="space-y-1 pt-3">
              {toc.map((item) => (
                <li key={item.url}>
                  <button
                    type="button"
                    onClick={() => handleClick(item.url)}
                    className={cn(
                      'block w-full text-left text-sm transition-colors hover:text-foreground',
                      getIndentClass(item.depth),
                      activeId === item.url
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
