'use client';

import { MessageSquare } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../auth/AuthProvider';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CommentSection({ slug }: { slug: string }) {
  const { isAuthenticated, userProfile, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          content: newComment,
          author: userProfile?.username || userProfile?.firstName || 'Anonymous',
        }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-xl font-semibold tracking-tight">Comments ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>

      {/* Comment Form */}
      <div className="pt-6 border-t">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              className="min-h-[100px] resize-none"
            />
            <Button type="submit">Post Comment</Button>
          </form>
        ) : (
          <div className="rounded-xl border bg-muted/50 p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">Please log in to leave a comment.</p>
            <Button onClick={login} variant="outline">
              Log In with SSO
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
