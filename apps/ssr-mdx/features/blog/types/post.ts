export type PostMetaData = {
  title: string;
  description: string;
  date: string;
  image?: string;
  category?: string;
};

export type Post = {
  metadata: PostMetaData;
  slug: string;
  content: string;
};
