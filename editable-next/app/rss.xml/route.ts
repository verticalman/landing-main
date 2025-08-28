import { NextResponse } from 'next/server';
import { getAllPosts, SITE } from '../blog/posts';

function escape(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getAllPosts();
  const base = SITE.url.replace(/\/$/, '');

  const items = posts
    .map(
      (p) => `\n    <item>\n      <title>${escape(p.title)}</title>\n      <link>${base}/blog/${p.slug}</link>\n      <guid>${base}/blog/${p.slug}</guid>\n      <pubDate>${new Date(p.date).toUTCString()}</pubDate>\n      <description>${escape(p.description)}</description>\n    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escape(SITE.name)} Blog</title>\n    <link>${base}</link>\n    <description>Insights on creative systems, brand, motion, and AI from ${escape(SITE.name)}.</description>\n    ${items}\n  </channel>\n</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
