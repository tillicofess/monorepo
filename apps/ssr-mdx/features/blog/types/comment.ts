export interface Comment {
  id: number;
  slug: string;
  author: string;
  email?: string;
  avatar?: string;
  content: string;
  date: string;
  parentId?: number | null;
  status: CommentStatus;
  ipAddress?: string;
  userAgent?: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface CommentCreateInput {
  slug: string;
  author: string;
  email?: string;
  content: string;
  parentId?: number | null;
}
