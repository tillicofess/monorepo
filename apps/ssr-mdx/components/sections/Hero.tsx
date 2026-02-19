'use client';

import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
  {
    name: 'Email',
    href: 'mailto:hello@example.com',
    icon: Mail,
  },
];

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-20 md:py-32">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Developer & Writer</h1>
        <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
          Building things with code and writing about the journey.
          <br className="hidden sm:inline" />
          Exploring web development, design systems, and modern technologies.
        </p>
      </div>
      <div className="flex gap-2">
        {socialLinks.map((link) => (
          <Button
            key={link.name}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            asChild
          >
            <Link href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
              <link.icon className="h-4 w-4" />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
