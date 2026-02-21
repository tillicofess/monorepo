import { HeroDecoration } from '@/features/portfolio/components/hero-decoration';
import { Posts } from '@/features/portfolio/components/Posts';
import { ProfileHeader } from '@/features/portfolio/components/profile-header';
import { Separator } from '@/features/portfolio/components/separator';
import { TechStack } from '@/features/portfolio/components/TechStack';

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
