export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO string
  tags: string[];
  author?: string;
  image?: string; // optional thumbnail/cover path under public/
  content?: string[]; // paragraphs (optional if markdownPath provided)
  markdownPath?: string; // relative path to markdown file in repo (e.g., 'public/Design as Dialogue.md')
};

// Normalize base URL to avoid trailing slash issues (e.g., https://fater.ai/ -> https://fater.ai)
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const NORMALIZED_SITE_URL = RAW_SITE_URL.replace(/\/$/, '');

export const SITE = {
  name: 'Fater',
  url: NORMALIZED_SITE_URL,
  twitter: '@fater',
};

export const posts: Post[] = [
  {
    slug: 'joining-nvidia-inception-program',
    title: 'We’re joining NVIDIA’s Inception Program',
    description: 'Access to NVIDIA’s platform and compute to supercharge real, production‑grade AI for the built world.',
    date: '2025-08-27T00:00:00.000Z',
    tags: ['announcement', 'NVIDIA', 'Inception', 'AI infrastructure'],
    image: '/nvidia-inception.jpeg',
    content: [
      'We’re joining NVIDIA’s Inception Program!',
      'Now we’ve got NVIDIA’s beast‑mode compute power at our fingertips, we’re able to deliver some (real) AI to our partners. With this kind of hardware, our pilots are about to get supercharged.',
      'Here’s the deal: Design is king. Your design vision? That’s your money maker. But let’s be honest—current workflows are killing your potential. They’re expensive, overly complex, and way too time‑consuming.',
      'That’s why we’ve been building one of the most advanced solutions out there to tackle cost, complexity, and inefficiencies head‑on, so you can focus on what really matters: creating something amazing.',
      'Onward — and huge thanks to the NVIDIA team for the support.',
    ],
  },
  {
    slug: 'design-as-dialogue',
    title: 'Design as Dialogue — Why Speech Is the Next Operating System',
    description: 'Spoken design shifts software from tool operation to a conversation with the medium — where intent becomes the API.',
    date: '2025-08-26T00:00:00.000Z',
    tags: ['essay', 'speech', 'design', 'interfaces', 'AI'],
    author: 'Youssef Guessous',
    image: '/Design-as-Dialogue---Cover.jpg',
    markdownPath: 'public/Design as Dialogue.md',
    content: [
      'Software has always been a negotiation between intention and instrument. Spoken design proposes a reversal: software learns us.',
      'From operating a tool to conversing with a medium — speech returns the continuous stream of meaning: context, emphasis, gesture, subtext.',
      'When software learns to listen, the material of design stops being the application and becomes the idea itself. The interface recedes. The designer remains.',
      'Language is the original design tool. What has been missing is an instrument that hears ordinary language and returns extraordinary fidelity.',
      'Wittgenstein taught that meaning is use; Schön described design as a reflective conversation with the materials. Generative systems give the material a voice.',
      'Intent becomes the API: express constraints and outcomes — the agentic stack absorbs the arcana and returns options with trade‑offs explicit.',
      'Craft concentrates upstream: judgment, direction, and shared vocabulary with the system so taste becomes teachable.',
      'Ambiguity is a feature: the system should ask clarifying questions, offer sketches before commitments, and learn your idiolect.',
      'The future of design is speech — not prompt theatrics, but the language designers already use when they are in the room together.'
    ],
  },
  // Homepage articles — Microsoft France and Maddyness
  {
    slug: 'microsoft-france-genai-studio',
    title: 'Microsoft + Fater AI — GenAI Studio at STATION F',
    description: 'We joined Microsoft’s GenAI Studio at STATION F — spoken design is the future and we’re building it.',
    date: '2024-10-15T00:00:00.000Z',
    tags: ['Microsoft', 'GenAI Studio', 'press'],
    author: 'Youssef Guessous',
    image: '/news-1.jpg', // group photo
    markdownPath: 'public/microsoft-france-genai-studio.md',
  },
  {
    slug: 'maddyness-feature-genai-studio',
    title: 'Demo Day — GenAI Studio',
    description: 'Coverage of our Demo Day — building the spoken design stack.',
    date: '2024-09-15T00:00:00.000Z',
    tags: ['Demo Day', 'press', 'GenAI Studio'],
    author: 'Youssef Guessous',
    image: '/news-2.jpg', // Youssef with mic
    markdownPath: 'public/maddyness-feature.md',
  },
];

export function getAllPosts() {
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

// Shared featured selection used by blog index and homepage
export const FEATURED_SLUGS: readonly string[] = [
  'design-as-dialogue',
  'maddyness-feature-genai-studio',
] as const;

export function getFeaturedPosts(): Post[] {
  const map = new Map(posts.map(p => [p.slug, p] as const));
  return FEATURED_SLUGS.map(slug => map.get(slug)).filter(Boolean) as Post[];
}

export function getNonFeaturedPosts(): Post[] {
  const set = new Set(FEATURED_SLUGS);
  return getAllPosts().filter(p => !set.has(p.slug));
}
