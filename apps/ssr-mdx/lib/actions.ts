'use server';

import { revalidatePath } from 'next/cache';
import type { Comment, CommentCreateInput } from '@/features/blog/types/comment';
import { execute, query } from '@/lib/db';

export async function getComments(slug: string): Promise<Comment[]> {
  const rows = await query('SELECT * FROM comments WHERE slug = ? ORDER BY date DESC', [slug]);
  return rows as Comment[];
}

export async function addComment(data: CommentCreateInput): Promise<Comment> {
  const result = await execute(
    'INSERT INTO comments (slug, author, email, content, date) VALUES (?, ?, ?, ?, NOW())',
    [data.slug, data.author, data.email || null, data.content],
  );

  const rows = (await query('SELECT * FROM comments WHERE id = ?', [result.insertId])) as Comment[];

  if (!rows[0]) {
    throw new Error('Failed to create comment');
  }

  revalidatePath(`/blog/${data.slug}`);

  return rows[0];
}
