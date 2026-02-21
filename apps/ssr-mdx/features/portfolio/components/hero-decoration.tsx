'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

export function HeroDecoration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = linesRef.current;
    if (!lines) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines.children,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
        },
      );

      gsap.to(lines.children, {
        scaleX: 0.85,
        duration: 1.2,
        ease: 'sine.inOut',
        stagger: {
          each: 0.1,
          yoyo: true,
          repeat: -1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="screen-line-before screen-line-after relative flex flex-col gap-1 border-x border-edge px-4 py-3"
    >
      <div ref={linesRef} className="flex flex-col gap-1">
        <div className="h-0.5 w-16 origin-left bg-foreground" />
        <div className="h-0.5 w-24 origin-left bg-foreground" />
        <div className="h-0.5 w-20 origin-left bg-foreground" />
        <div className="h-0.5 w-12 origin-left bg-foreground" />
      </div>
      <div className="absolute bottom-1 right-4 font-mono text-xs text-muted-foreground">
        gsap animation
      </div>
    </div>
  );
}
