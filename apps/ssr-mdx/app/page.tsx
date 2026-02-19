import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Posts } from '@/components/sections/Posts';
import { TechStack } from '@/components/sections/TechStack';
import { getAllPosts } from '@/lib/mdx';

export default function Home() {
  const posts = getAllPosts(['title', 'date', 'slug', 'author']);
  console.log('Environment:', process.env.NODE_ENV);

  return (
    <div className="flex min-h-screen flex-col">
      <Header posts={posts} />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Hero />
          <TechStack />
          <Posts posts={posts} />
        </div>
      </main>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
}
