'use client';

import { ArrowUp, Github, Rss, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'RSS', href: '/rss', icon: Rss },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t py-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Built with Next.js & shadcn/ui
          </p>
        </div>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Button key={link.name} variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={link.name}
              >
                <link.icon className="h-4 w-4" />
              </Link>
            </Button>
          ))}
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={scrollToTop}>
            Back to top
            <ArrowUp className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
