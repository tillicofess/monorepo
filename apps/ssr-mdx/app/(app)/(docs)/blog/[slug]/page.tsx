import { getTableOfContents } from 'fumadocs-core/content/toc';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Prose } from '@/components/ui/typography';
import { InlineToc } from '@/features/blog/components/inline-toc';
import { MDX } from '@/features/blog/components/mdx';
import { Separator } from '@/features/portfolio/components/separator';
import { getPostBySlug } from '@/lib/mdx';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.content) {
    notFound();
  }

  const toc = getTableOfContents(post.content);

  return (
    <>
      <div className="flex items-center justify-between p-2 pl-4">
        <Button
          className="h-7 gap-2 rounded-lg px-0 font-mono text-muted-foreground transition-[color] hover:text-foreground"
          variant="link"
          asChild
        >
          <Link href="/blog">
            <ArrowLeftIcon />
            Blog
          </Link>
        </Button>
      </div>

      <div className="screen-line-before screen-line-after">
        <Separator />
      </div>

      <Prose className="px-4">
        <h1 className="screen-line-after text-3xl font-semibold tracking-tight">
          {post.metadata.title}
        </h1>

        <p className="text-muted-foreground">{post.metadata.description}</p>

        <InlineToc toc={toc} />

        <div>
          <MDX code={post.content} />
        </div>
      </Prose>
    </>
  );
}
