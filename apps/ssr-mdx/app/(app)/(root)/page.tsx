import { HeroDecoration } from '@/features/portfolio/components/hero-decoration';
import { Posts } from '@/features/portfolio/components/Posts';
import { ProfileHeader } from '@/features/portfolio/components/profile-header';
import { TechStack } from '@/features/portfolio/components/TechStack';

import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="mx-auto md:max-w-3xl *:[[id]]:scroll-mt-22">
      <HeroDecoration />
      <ProfileHeader />
      <Separator />

      <TechStack />
      <Separator />

      <Posts />
      <Separator />
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-8 w-full border-x border-edge',
        'before:absolute before:-left-[100vw] before:-z-1 before:h-8 before:w-[200vw]',
        'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56',
        className,
      )}
    />
  );
}
