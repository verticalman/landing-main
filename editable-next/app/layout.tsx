import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
  title: {
    default: 'Fater — Create the world.',
    template: '%s | Fater'
  },
  description: 'Redefining design with agentic AI. We enable design and development teams to build and scale their creative processes with unprecedented control. Backed by NVIDIA & Microsoft. ',
  keywords: ['Fater', 'Fater AI', 'AI design', 'AI architecture', 'Design automation', 'Built world AI', 'Microsoft GenAI Studio'],
  applicationName: 'Fater',
  authors: [{ name: 'Fater' }],
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Fater — Create the world.',
    description: 'Redefining design with agentic AI. We enable design and development teams to build and scale their creative processes with unprecedented control. Backed by NVIDIA & Microsoft.',
    url: '/',
    siteName: 'Fater',
    type: 'website',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Fater — Create the world.',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fater — Create the world.',
    description: 'Redefining design with agentic AI. We enable design and development teams to build and scale their creative processes with unprecedented control. Backed by NVIDIA & Microsoft.',
    images: ['/og.jpg'],
  }
};

import './globals.css';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" title="Fater Blog RSS" />
        <link
          rel="preload"
          href="/fonts/Roobert-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Roobert-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
