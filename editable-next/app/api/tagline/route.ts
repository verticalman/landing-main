import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Instruction for the agent
const SYSTEM = `You generate exactly one sentence of exactly five words.
- The sentence must be inspired by this manifesto:
  "We build agentic AI design systems that scale.
   Our mission is to industrialise creation,
   We believe that the godly UX of speech,
   is the last phase of software evolution."
- Constraints:
  * Exactly 5 words, no more, no less.
  * Natural, impactful, and brand-appropriate.
  * No punctuation except spaces; casing is up to you (do not force all-caps).
  * Do not number, do not quote.
`;

export async function GET() {
  return handler();
}

export async function POST(req: NextRequest) {
  return handler();
}

async function handler() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt5-mini'; // as requested
  if (!apiKey) {
    return Response.json({
      text: fallbackSentence(),
      note: 'OPENAI_API_KEY missing; returned fallback sentence.'
    }, { status: 200 });
  }
  try {
    const openai = new OpenAI({ apiKey });
    // Use responses API to get a short single-line output
    const res = await openai.responses.create({
      model,
      input: SYSTEM,
      max_output_tokens: 32,
    });
    const text = (res.output?.[0] as any)?.content?.[0]?.text
      || (res as any).output_text
      || (res as any).choices?.[0]?.message?.content
      || '';

    const cleaned = forceFiveWords(text);
    return new Response(JSON.stringify({ text: cleaned }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err) {
    // Fallback gracefully on any API error
    return new Response(JSON.stringify({ text: fallbackSentence(), note: 'OpenAI error; used fallback.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  }
}

function forceFiveWords(input: string): string {
  const stripped = input
    .replace(/[\n\r]/g, ' ')
    .replace(/[^A-Za-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  let words = stripped.split(' ').filter(Boolean);
  if (words.length === 5) return stripped;
  if (words.length > 5) return words.slice(0, 5).join(' ');
  // If fewer than 5, pad with plausible words from the manifesto keywords
  const pad = ['Agentic', 'AI', 'Design', 'Systems', 'Scale', 'Speech', 'Evolution'];
  while (words.length < 5) words.push(pad[(words.length) % pad.length]);
  return words.join(' ');
}

function fallbackSentence(): string {
  // Deterministic, brand-appropriate 5-word fallback
  return 'Industrialize Agentic AI Design Systems';
}
