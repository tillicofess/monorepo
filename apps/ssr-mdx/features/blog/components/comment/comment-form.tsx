'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addComment } from '@/lib/actions';

interface Props {
  slug: string;
}

export function CommentForm({ slug }: Props) {
  const { login, isAuthenticated, userProfile } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPending(true);
    try {
      await addComment({
        slug,
        content,
        author: userProfile?.username || 'lain',
      });
      setContent('');
      router.refresh();
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            maxLength={3000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            className="min-h-25 resize-none"
          />
          <Button type="submit" disabled={pending}>
            {pending ? 'Posting...' : 'Post Comment'}
          </Button>
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
  );
}
