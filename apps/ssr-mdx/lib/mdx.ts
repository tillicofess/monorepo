import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  title: string;
  slug: string;
  date: string;
  author: string;
  content?: string;
  [key: string]: string | undefined;
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []): PostData {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items: PostData = {
    title: '',
    slug: realSlug,
    date: '',
    author: '',
  };

  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
    } else if (field === 'content') {
      items[field] = content;
    } else if (typeof data[field] === 'string') {
      items[field as keyof PostData] = data[field];
    }
  });

  return items;
}

export function getAllPosts(fields: string[] = []): PostData[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export async function getHeadings(source: string) {
  const slugger = new GithubSlugger();
  const headings: Array<{ level: number; text: string; slug: string }> = [];

  // Remove code blocks (fenced and indented) to avoid matching comments as headings
  const sourceWithoutCodeBlocks = source
    // Remove fenced code blocks (```...``` or ~~~...~~~)
    .replace(/^(```|~~~)[\s\S]*?\1$/gm, '')
    // Remove indented code blocks (4+ spaces or tab at start)
    .replace(/^(\t|[ ]{4,}).*$/gm, '');

  const headingRegex = /^(#{1,6})\s+(.*)$/gm;
  let match = headingRegex.exec(sourceWithoutCodeBlocks);

  while (match !== null) {
    const level = match[1]?.length ?? 0;
    const text = match[2]?.trim() ?? '';
    const slug = slugger.slug(text);
    headings.push({ level, text, slug });
    match = headingRegex.exec(sourceWithoutCodeBlocks);
  }

  return headings;
}
