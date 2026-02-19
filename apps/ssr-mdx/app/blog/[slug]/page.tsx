import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import CommentSection from '@/components/comments/CommentSection';
import PackageManagerTabs from '@/components/mdx/PackageManagerTabs';
import Pre from '@/components/mdx/Pre';
import { ReadingProgress } from '@/components/mdx/ReadingProgress';
import Sandpack from '@/components/mdx/Sandpack';
import { TableOfContents } from '@/components/mdx/TableOfContents';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { getAllPosts, getHeadings, getPostBySlug } from '@/lib/mdx';

const components = {
  Sandpack,
  PackageManagerTabs,
  pre: Pre,
};

interface PostData {
  title: string;
  slug: string;
  date: string;
  author: string;
}

export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug, ['title', 'date', 'author', 'content']);

  if (!post || !post.content) {
    notFound();
  }

  const headings = await getHeadings(post.content);
  const readingTime = calculateReadingTime(post.content);
  const allPosts = getAllPosts(['title', 'date', 'slug', 'author']) as PostData[];

  return (
    <div className="flex min-h-screen flex-col">
      <ReadingProgress />
      <Header posts={allPosts} />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
            <Link href="/blog" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to articles
            </Link>
          </Button>

          {/* Article Header */}
          <header className="mb-10">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              <span>·</span>
              <span>by {post.author}</span>
            </div>

            {/* Table of Contents Collapsible */}
            <TableOfContents headings={headings} />
          </header>

          {/* Main Content */}
          <article>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <MDXRemote
                source={post.content}
                components={components}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeSlug,
                      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                      [
                        rehypePrettyCode,
                        {
                          theme: 'github-dark',
                          keepBackground: false,
                        },
                      ],
                    ],
                  },
                }}
              />
            </div>

            {/* Comments Section */}
            <div className="mt-16 pt-10 border-t">
              <CommentSection slug={slug} />
            </div>
          </article>
        </div>
      </main>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
}
