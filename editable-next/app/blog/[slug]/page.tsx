import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, SITE } from '../posts';
import PostClient from './PostClient';
import { readFile } from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `${SITE.url}/blog/${post.slug}`;
  const ogImages = post.image ? [{ url: `${SITE.url}${post.image}` }] : undefined;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    keywords: post.tags,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      siteName: SITE.name,
      authors: post.author ? [post.author] : undefined,
      publishedTime: post.date,
      images: ogImages,
    },
    twitter: {
      card: post.image ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.description,
      images: ogImages?.map(i => i.url),
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  let html: string | undefined = undefined;
  if (post.markdownPath) {
    try {
      const full = path.join(process.cwd(), post.markdownPath);
      let md = await readFile(full, 'utf8');
      const renderer = new marked.Renderer();
      // Remove images from markdown so we only use our page header image
      renderer.image = () => '';
      // Convert bold-only lines in raw markdown to H2 headings (mid titles)
      md = md.replace(/^\*\*(.+?)\*\*\s*$/gm, '## $1');
      // Remove a standalone author signature line like "Youssef Guessous"
      md = md.replace(/^\s*Youssef\s+Guessous\s*$/m, '');
      html = marked.parse(md, { renderer }) as string;
    } catch (e) {
      console.error('Failed to read markdown for post', post.slug, e);
    }
  }

  return <PostClient post={post} html={html} />;
}
