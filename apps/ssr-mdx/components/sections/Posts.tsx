import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Post {
  title: string;
  slug: string;
  date: string;
  author?: string;
}

interface PostsProps {
  posts: Post[];
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

export function Posts({ posts }: PostsProps) {
  const latestPosts = posts.slice(0, 6);

  return (
    <section className="py-12 md:py-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Latest Posts</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {latestPosts.map((post) => (
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
  );
}
