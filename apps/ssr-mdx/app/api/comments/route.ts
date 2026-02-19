import { NextResponse } from 'next/server';

// Mock database
const comments: { id: string; slug: string; author: string; content: string; date: string }[] = [
  {
    id: '1',
    slug: 'hello-world',
    author: 'System',
    content: 'Welcome to the comments section!',
    date: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  const postComments = comments.filter((c) => c.slug === slug);
  return NextResponse.json(postComments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, content, author } = body;

    if (!slug || !content || !author) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newComment = {
      id: Date.now().toString(),
      slug,
      author,
      content,
      date: new Date().toISOString(),
    };

    comments.push(newComment);

    return NextResponse.json(newComment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
