import { getComments } from '@/lib/actions';
import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';

interface Props {
  slug: string;
}

export async function CommentSection({ slug }: Props) {
  const comments = await getComments(slug);

  return (
    <section className="space-y-6 px-4 py-6">
      <CommentForm slug={slug} />

      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold tracking-tight">Comments ({comments.length})</span>
      </div>

      <CommentList comments={comments} />
    </section>
  );
}
