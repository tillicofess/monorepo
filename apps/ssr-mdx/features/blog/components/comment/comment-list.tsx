import type { Comment } from '../../types/comment';

interface Props {
  comments: Comment[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CommentList({ comments }: Props) {
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{comment.author}</span>
              <time className="text-xs text-muted-foreground">{formatDate(comment.date)}</time>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
          </article>
        ))
      )}
    </div>
  );
}
