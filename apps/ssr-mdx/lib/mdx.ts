import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';
import { cache } from 'react';
import type { Post, PostMetaData } from '@/features/blog/types/post';

function parseFrontmatter(fileContent: string) {
  const file = matter(fileContent);

  return {
    metadata: file.data as PostMetaData,
    content: file.content,
  };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);

  return mdxFiles.map<Post>((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));

    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export const getAllPosts = cache(() => {
  return getMDXData(path.join(process.cwd(), 'features/blog/content')).sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
  });
});

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((post) => post.metadata?.category === category);
}

export type Heading = {
  level: number;
  text: string;
  slug: string;
};

export function getHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  const sourceWithoutCodeBlocks = source
    .replace(/^(```|~~~)[\s\S]*?\1$/gm, '')
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
