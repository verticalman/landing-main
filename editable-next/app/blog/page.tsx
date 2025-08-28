import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights on creative systems, brand, motion, and AI from Fater.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndex() {
  return <BlogClient />;
}
