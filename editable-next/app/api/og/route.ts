import { NextResponse } from 'next/server';

// Simple Open Graph image extractor: /api/og?url=<encoded_url>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('url');
    if (!target) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(target, {
      // Avoid caching to always fetch the latest OG tags
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FaterBot/1.0; +https://fater.ai)'
      },
      signal: controller.signal,
      redirect: 'follow',
    }).catch((e) => {
      return new Response(null, { status: 500, statusText: String(e) }) as any;
    });
    clearTimeout(timeout);

    if (!res || !('ok' in res) || !(res as any).ok) {
      return NextResponse.json({ image: null }, { status: 200 });
    }

    const html = await (res as Response).text();

    const pick = (prop: string) => {
      const regex = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
      const m = html.match(regex);
      return m ? m[1] : null;
    };
    const pickName = (name: string) => {
      const regex = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
      const m = html.match(regex);
      return m ? m[1] : null;
    };

    const candidates = [
      pick('og:image:secure_url'),
      pick('og:image'),
      pickName('twitter:image'),
      pickName('twitter:image:src'),
    ].filter(Boolean) as string[];

    // Try to extract publish date from common tags
    const dateCandidates = [
      pick('article:published_time'),
      pickName('pubdate'),
      pickName('timestamp'),
      pickName('date'),
      pickName('DC.date.issued'),
      pickName('dcterms.date'),
      (() => {
        const m = html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i);
        return m ? m[1] : null;
      })(),
    ].filter(Boolean) as string[];

    const image = candidates.length ? candidates[0] : null;
    const published = dateCandidates.length ? dateCandidates[0] : null;
    return NextResponse.json({ image, published });
  } catch (e) {
    return NextResponse.json({ image: null }, { status: 200 });
  }
}
