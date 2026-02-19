import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/mdx';

interface Post {
  title: string;
  date: string;
  slug: string;
  author: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function calculateReadingTime(): number {
  return 5;
}

function groupPostsByYear(posts: Post[]): Record<string, Post[]> {
  return posts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, Post[]>,
  );
}

export default function BlogPage() {
  const posts = getAllPosts(['title', 'date', 'slug', 'author']);
  const groupedPosts = groupPostsByYear(posts);
  const years = Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="flex min-h-screen flex-col">
      <Header posts={posts} />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href="/" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">All Articles</h1>
            <p className="mt-2 text-muted-foreground">
              {posts.length} posts about development, design, and ideas.
            </p>
          </div>

          <div className="space-y-12">
            {years.map((year) => (
              <section key={year}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {year}
                </h2>
                <div className="grid gap-4">
                  {groupedPosts[year].map((post) => (
                    <article
                      key={post.slug}
                      className="group relative rounded-xl border p-6 transition-colors hover:bg-muted/50"
                    >
                      <Link href={`/blog/${post.slug}`} className="block">
                        <h3 className="mb-2 text-lg font-semibold tracking-tight group-hover:underline">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                          <span>·</span>
                          <span>{calculateReadingTime()} min read</span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
}
