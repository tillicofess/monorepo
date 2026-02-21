import { PostList } from '@/features/blog/components/post-list';
import { getAllPosts } from '@/lib/mdx';

export default function BlogPage() {
  const allPosts = getAllPosts();

  return (
    <div>
      <div className="screen-line-after px-4">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      </div>

      <PostList posts={allPosts} />

      <div className="h-4" />
    </div>
  );
}
