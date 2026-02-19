'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

// Header height + padding for scroll offset
const HEADER_OFFSET = 80;

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [open, setOpen] = useState(true);

  // Filter headings to show h1, h2, and h3 only
  const displayHeadings = headings.filter((h) => h.level <= 3);

  useEffect(() => {
    if (displayHeadings.length === 0) return;

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

    displayHeadings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      displayHeadings.forEach((heading) => {
        const element = document.getElementById(heading.slug);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [displayHeadings]);

  if (displayHeadings.length === 0) return null;

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

  // Calculate indent based on heading level
  const getIndentClass = (level: number) => {
    switch (level) {
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
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
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
              {displayHeadings.map((heading) => (
                <li key={heading.slug}>
                  <button
                    type="button"
                    onClick={() => handleClick(heading.slug)}
                    className={`block w-full text-left text-sm transition-colors hover:text-foreground ${getIndentClass(heading.level)} ${
                      activeId === heading.slug
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {heading.text}
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
