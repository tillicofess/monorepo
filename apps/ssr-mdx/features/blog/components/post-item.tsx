import { format } from 'date-fns';
import Link from 'next/link';

import type { Post } from '@/features/blog/types/post';
import { cn } from '@/lib/utils';

export function PostItem({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-col gap-2 p-2',
        'max-sm:screen-line-before max-sm:screen-line-after',
        'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after',
      )}
    >
      <div className="flex flex-col gap-1 p-2">
        <h3 className="text-lg leading-snug font-medium text-balance underline-offset-4 group-hover:underline">
          {post.metadata.title}
        </h3>

        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-sm text-muted-foreground">
            <time dateTime={new Date(post.metadata.date).toISOString()}>
              {format(new Date(post.metadata.date), 'dd.MM.yyyy')}
            </time>
          </dd>
        </dl>
      </div>
    </Link>
  );
}
