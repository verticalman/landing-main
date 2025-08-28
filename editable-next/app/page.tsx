"use client";
import styles from './page.module.css';
import HeroCanvas from '../components/HeroCanvas';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as simpleIcons from 'simple-icons';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedPosts } from './blog/posts';
import BubblePicker, { type BubbleOption, type BubblePickerHandle } from '../components/BubblePicker';
import Footer from '../components/Footer';
import logoAlta from '../ALTA.PA_BIG.D-1861938f.png';
import logoUrw from '../URW-WHITE-png.png';
// Removed Auchan from partners
import logoNvidia from '../Nvidia-White-Horizontal-Logo.wine.svg';

export default function Home() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const sideNavRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroVisibleRef = useRef<boolean>(true);
  const [clicked, setClicked] = useState(false);
  const USE_AGENT_TAGLINE = false; // keep agent code, but disabled per request
  const SHOW_TAGLINE = false; // hide tagline in loading overlay per request
  const SHOW_LOADING_UI = true; // show number + logo over black cover during loading
  const [tagline, setTagline] = useState<string>('enter fater');
  const [typed, setTyped] = useState<string>('');
  const [typedDone, setTypedDone] = useState<boolean>(false);
  const [taglineFading, setTaglineFading] = useState<boolean>(false);
  const [showNumber, setShowNumber] = useState<boolean>(false);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const verbWrapRef = useRef<HTMLSpanElement>(null);
  const verbSizerRef = useRef<HTMLSpanElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const [contactVisible, setContactVisible] = useState(false);
  const partnersBlockRef = useRef<HTMLDivElement>(null);
  const [partnersVisible, setPartnersVisible] = useState(false);
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  // Screen size state to control mobile behavior
  const [isSmall, setIsSmall] = useState(false);
  // Footer form state
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  // Footer form: Industry bubble picker (Notion-style tiny pill)
  const BUBBLE_OPTIONS: BubbleOption[] = [
    { label: 'Architecture', value: 'Architecture', colorClass: 'colArchitecture', dotClass: 'dotArchitecture' },
    { label: 'Design', value: 'Design', colorClass: 'colDesign', dotClass: 'dotDesign' },
    { label: 'Retail', value: 'Retail', colorClass: 'colRetail', dotClass: 'dotRetail' },
    { label: 'Engineering', value: 'Engineering', colorClass: 'colEngineering', dotClass: 'dotEngineering' },
    { label: 'Other', value: 'Other', colorClass: 'colOther', dotClass: 'dotOther' },
  ];
  const [industry, setIndustry] = useState<string>('');
  const industryPickerRef = useRef<BubblePickerHandle>(null);
  // Latest news visibility and data (now sourced from blog featured posts)
  const newsRef = useRef<HTMLDivElement>(null);
  const [newsVisible, setNewsVisible] = useState(false);
  const featuredPosts = getFeaturedPosts();
  const newsArticles = featuredPosts.map((p, i) => ({
    url: `/blog/${p.slug}`,
    meta: p.date, // ISO, will be formatted below
    headline: p.title,
    description: p.description,
    tags: p.tags || [],
    image: p.image || (i === 0 ? '/news-1.jpg' : '/news-2.jpg'),
  }));
  const newsImgRefs = useRef<HTMLDivElement[]>([]);
  newsImgRefs.current = [];
  const setNewsImgRef = (el: HTMLDivElement | null) => {
    if (el && !newsImgRefs.current.includes(el)) newsImgRefs.current.push(el);
  };

  // Helpers to open/close menu with animation
  const openMenu = () => { setMenuClosing(false); setMobileMenuOpen(true); };
  const closeMenu = () => {
    setMenuClosing(true);
    // Allow CSS closing animation to play before unmount
    setTimeout(() => { setMobileMenuOpen(false); setMenuClosing(false); }, 700);
  };
  // Wrap nav click to also close the mobile menu (animated)
  const onNavAndClose = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    onNavClick(e, id);
    closeMenu();
  };

  const onToggleMenu = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (mobileMenuOpen || menuClosing) {
      closeMenu();
    } else {
      openMenu();
    }
  };
  // FAQ section state
  const faqRef = useRef<HTMLDivElement>(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqItems = [
    {
      q: 'What is Fater and how does it work?',
      a:
        'Fater is an agentic AI design system. It learns how your team designs, turns that know‑how into reusable programs, and runs them at scale.\n' +
        'Agents select the right models and tools for each task, from concept to iterations to delivery.\n' +
        'Work happens on an infinite canvas with voice or text commands, and results are fully traceable and repeatable.'
    },
    {
      q: 'How is Fater different from other AI design tools?',
      a:
        'Process‑first: we capture your workflow and automate it, not just generate one‑off assets.\n' +
        'Multi‑model orchestration: agents choose specialized models and parameters per step.\n' +
        'Verticalized programs: architecture, interiors, brand, product—each with tailored controls.\n' +
        'Human‑in‑the‑loop: you steer; agents execute, compare options, and document decisions.'
    },
    {
      q: 'How do we get started and integrate Fater?',
      a:
        'Pilot engagement: a short discovery maps your workflow and success metrics.\n' +
        'Program building: we codify your steps into Fater programs and connect your tools (CAD/BIM, rendering, storage, PM via APIs).\n' +
        'Onboarding: your team runs voice/text prompts, reviews outputs, and tunes guardrails. Scale from one workflow to many as ROI is proven.'
    },
    {
      q: 'How is Fater priced?',
      a:
        'Fater charges a flat annual fee based on your program volume and usage profile. This removes surprises and makes budgets predictable. We manage integration and hosting, and offer unlimited seats for your team. Enterprise options—such as private model hosting and SLAs—are available. Contact sales for a tailored quote and ROI model.'
    },
  ] as const;
  const onToggleFaq = (i: number) => {
    setFaqOpen(prev => (prev === i ? null : i));
  };
  // Manifesto copy: compact phrasing for phone/tablet, fuller phrasing for desktop
  const manifestoLinesText: { text: string; bold?: boolean }[] = isSmall ? [
    { text: 'We build agentic AI systems' },
    { text: 'for built world design.' }, 
    { text: 'We believe in the godly UX of speech,' },
    { text: 'as the last phase of software evolution.' },
  ] : [
    { text: 'We build agentic AI systems' },
    { text: 'for built world design.' }, 
    { text: 'We believe in the godly UX of speech,' },
    { text: 'as the last phase of software evolution.' },
  ];
  const verbs = ['create', 'design', 'sculpt'];
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState<{stage: 'idle'|'out'|'in', next: number | null}>({stage: 'idle', next: null});
  const [incomingActive, setIncomingActive] = useState(false);
  const [tick, setTick] = useState(0); // forces re-render for random per-letter offsets
  const [wrapWidth, setWrapWidth] = useState<number | null>(null);
  // Loading overlay state
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'loading' | 'hero'>('loading');
  const [shaderReady, setShaderReady] = useState(false);
  const [fadeComplete, setFadeComplete] = useState(false);
  const scrollLockY = useRef<number>(0);
  // Number dissolve-in animation control (only for the first number)
  const [numActive, setNumActive] = useState(false);
  const [animateFirstNumber, setAnimateFirstNumber] = useState(true);
  // Hysteresis state keyed by element to avoid index/visual-order mismatch
  const frontierElRef = useRef<HTMLElement | null>(null);
  const fillMaxMapRef = useRef<WeakMap<HTMLElement, number>>(new WeakMap());
  const smoothFillMapRef = useRef<WeakMap<HTMLElement, number>>(new WeakMap());

  // Shared smooth-scroll handler used by sideNav links
  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      if (prefersReduced) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      // Fallback if scrollIntoView options unsupported
      const rect = target.getBoundingClientRect();
      const top = (window.scrollY || window.pageYOffset || 0) + rect.top;
      if (prefersReduced) {
        window.scrollTo(0, top);
      } else {
        try {
          window.scrollTo({ top, behavior: 'smooth' as ScrollBehavior });
        } catch {
          window.scrollTo(0, top);
        }
      }
    }
    // Ensure URL reflects the section, but avoid redundant push that could cancel default behavior
    if (location.hash !== `#${id}`) {
      try { history.pushState(null, '', `#${id}`); } catch {}
    }
  };

  // Smooth scroll back to top for footer button
  const onBackToTopClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const topEl = document.getElementById('top');
    const getY = () => (typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0);

    if (prefersReduced) {
      if (topEl && topEl.scrollIntoView) {
        try { topEl.scrollIntoView({ behavior: 'auto', block: 'start' }); } catch { window.scrollTo(0, 0); }
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      let usedNative = false;
      if (topEl && topEl.scrollIntoView) {
        try { topEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); usedNative = true; } catch {}
      }
      if (!usedNative) {
        try { window.scrollTo({ top: 0, behavior: 'smooth' as ScrollBehavior }); usedNative = true; } catch {}
      }
      // RAF fallback
      const startY = getY();
      if (!usedNative && startY > 0) {
        const duration = 600;
        const start = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = easeOutCubic(t);
          const y = Math.round(startY * (1 - eased));
          window.scrollTo(0, y);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
    if (location.hash) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch {}
    }
  };

  // Scroll parallax for heading
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || 0;
      const translate = Math.min(40, y * 0.08); // cap for subtlety
      if (h1Ref.current) h1Ref.current.style.transform = `translate3d(0, ${translate}px, 0)`;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Helper to apply header visibility instantly
  const applyHeaderVisibility = useCallback((visible: boolean) => {
    // Keep burger visible if mobile menu is open so users can close it
    const effectiveVisible = visible || mobileMenuOpen;
    const op = effectiveVisible ? 1 : 0;
    if (brandRef.current) {
      brandRef.current.style.opacity = String(op);
      brandRef.current.style.pointerEvents = op < 0.01 ? 'none' : '';
      try { brandRef.current.setAttribute('aria-hidden', op < 0.01 ? 'true' : 'false'); } catch {}
    }
    if (sideNavRef.current) {
      (sideNavRef.current as HTMLElement).style.opacity = String(op);
      (sideNavRef.current as HTMLElement).style.pointerEvents = op < 0.01 ? 'none' : '';
      try { (sideNavRef.current as HTMLElement).setAttribute('aria-hidden', op < 0.01 ? 'true' : 'false'); } catch {}
    }
    if (hamburgerRef.current) {
      hamburgerRef.current.style.opacity = String(op);
      hamburgerRef.current.style.pointerEvents = op < 0.01 ? 'none' : '';
      try { hamburgerRef.current.setAttribute('aria-hidden', op < 0.01 ? 'true' : 'false'); } catch {}
    }
    if (mainRef.current) mainRef.current.style.setProperty('--heroFade', String(op));
    try { document.documentElement.style.setProperty('--heroFade', String(op)); } catch {}
  }, [mobileMenuOpen]);

  // Instantly hide header when hero is not in view (works on mobile/desktop)
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        heroVisibleRef.current = visible;
        applyHeaderVisibility(visible);
      },
      {
        root: null,
        // As soon as the hero is fully out of viewport, we want hidden
        // Using a tiny threshold so visibility flips right after leaving view
        threshold: 0.01,
      }
    );
    obs.observe(hero);
    // Apply once on mount to reflect current state (e.g., reload mid-page)
    try {
      const r = hero.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < (window.innerHeight || 0);
      heroVisibleRef.current = visible;
      applyHeaderVisibility(visible);
    } catch {}
    return () => { try { obs.disconnect(); } catch {} };
  }, [applyHeaderVisibility]);

  // Track screen size for responsive logic
  useEffect(() => {
    const update = () => setIsSmall((typeof window !== 'undefined') ? window.innerWidth <= 900 : false);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Ensure fade is applied immediately when loading state changes (e.g., elements mount)
  useEffect(() => {
    // Apply current hero visibility when loading state flips
    applyHeaderVisibility(heroVisibleRef.current);
  }, [loading, applyHeaderVisibility]);

  // Keep burger visible while mobile menu is open, even if hero not visible
  useEffect(() => {
    applyHeaderVisibility(heroVisibleRef.current);
  }, [mobileMenuOpen, applyHeaderVisibility]);

  // Lock scroll while mobile menu is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    const body = document.body as HTMLBodyElement & { style: CSSStyleDeclaration & { top?: string } };
    if (mobileMenuOpen) {
      scrollLockY.current = window.scrollY || 0;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${scrollLockY.current}px`;
      body.style.touchAction = 'none';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      const top = body.style.top || '0px';
      body.style.top = '';
      body.style.touchAction = '';
      const y = parseInt(top.replace(/[^0-9-]/g, ''), 10) || 0;
      if (!loading) window.scrollTo(0, -y);
    }
  }, [mobileMenuOpen, loading]);

  // Reveal FAQ section on scroll
  useEffect(() => {
    const el = faqRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setFaqVisible(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.15, rootMargin: '0px 0px -12% 0px' }
    );
    obs.observe(el);
    return () => { try { obs.disconnect(); } catch {} };
  }, []);

  // No external fetch needed; images and dates come from featured posts

  // Parallax for news images
  useEffect(() => {
    function onScroll() {
      newsImgRefs.current.forEach((el) => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // -0.5..0.5 based on element center relative to viewport center
        const rel = ((r.top + r.height / 2) - vh / 2) / vh;
        const py = Math.max(-12, Math.min(12, -rel * 24)); // px translate
        el.style.setProperty('--py', `${py}px`);
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const formatDate = (iso: string | null): string | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Reveal Articles section on scroll (observe the whole section for robustness)
  useEffect(() => {
    const el = newsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setNewsVisible(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => { try { obs.disconnect(); } catch {} };
  }, []);

  // Fetch tagline once we are in the loading overlay (after shader fade)
  useEffect(() => {
    let aborted = false;
    async function getTagline() {
      try {
        const res = await fetch('/api/tagline', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!aborted && data && data.text) setTagline(String(data.text));
      } catch {}
    }
    if (SHOW_TAGLINE && USE_AGENT_TAGLINE && loading && fadeComplete) getTagline();
    return () => { aborted = true; };
  }, [loading, fadeComplete]);

  // Typewriter effect with human cadence and sequential reveal
  // If tagline is hidden, immediately show number+logo when overlay becomes visible
  useEffect(() => {
    if (!SHOW_TAGLINE && loading && fadeComplete) {
      setShowNumber(true);
      setShowLogo(true);
      setTaglineFading(false);
    }
  }, [SHOW_TAGLINE, loading, fadeComplete]);

  // Global background fade (black -> white) driven by footer visibility
  useEffect(() => {
    const footer = contactRef.current;
    const mainEl = mainRef.current;
    if (!footer || !mainEl) return;
    const thresholds = Array.from({ length: 51 }, (_, i) => i / 50);
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry ? entry.intersectionRatio : 0;
        const eased = Math.min(1, Math.max(0, ratio * 1.1));
        mainEl.style.setProperty('--bgw', String(eased));
      },
      { threshold: thresholds }
    );
    obs.observe(footer);
    return () => { try { obs.disconnect(); } catch {} };
  }, []);

  // Lock scroll while loading
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    const body = document.body as HTMLBodyElement & { style: CSSStyleDeclaration & { top?: string } };
    if (loading) {
      scrollLockY.current = window.scrollY || 0;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${scrollLockY.current}px`;
      body.style.touchAction = 'none';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      const top = body.style.top || '0px';
      body.style.top = '';
      body.style.touchAction = '';
      const y = parseInt(top.replace(/[^0-9-]/g, ''), 10) || 0;
      window.scrollTo(0, -y);
    }
  }, [loading]);

  // (Removed addEventListener approach) Relying on inline onClick handlers on <a> tags for smooth scrolling

  // Reveal contact/footer on scroll
  useEffect(() => {
    const el = contactRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setContactVisible(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.18 }
    );
    obs.observe(el);
    return () => { try { obs.disconnect(); } catch {} };
  }, []);

  // Reveal partners section (kicker + logos) on scroll
  useEffect(() => {
    const el = partnersBlockRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPartnersVisible(true);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.22 }
    );
    obs.observe(el);
    return () => { try { obs.disconnect(); } catch {} };
  }, []);

  // Ensure the loading sequence runs even if shaderReady never fires (fallback)
  const [loadingSeqStarted, setLoadingSeqStarted] = useState(false);
  const startLoadingSequence = useCallback(() => {
    if (loadingSeqStarted) return;
    setLoadingSeqStarted(true);
    const FADE_MS = 400; // faster initial fade
    let timers: any[] = [];
    // finish the shader fade-in cover
    const tFade = setTimeout(() => setFadeComplete(true), FADE_MS);
    timers.push(tFade);
    // Progress checkpoints compressed to keep total under 3s
    const checkpoints = [15, 55, 100];
    const totalProgressMs = 1400; // total time for progress updates after fade
    const stepMs = totalProgressMs / (checkpoints.length - 1);
    const END_DELAY_MS = 150; // allow progress to render 100 before ending
    checkpoints.forEach((val, i) => {
      const t = setTimeout(() => {
        setProgress(val);
        if (i === 0) {
          // Animate only the first number appearance
          setNumActive(false);
          requestAnimationFrame(() => setNumActive(true));
          // After the first number animates in, disable further animations
          setTimeout(() => setAnimateFirstNumber(false), 700);
        }
      }, FADE_MS + i * stepMs);
      timers.push(t);
    });
    // End loading within <= 3s total (fade + sequence), slightly after progress hits 100
    const tEnd = setTimeout(() => {
      setProgress(100);
      setPhase('hero');
      setLoading(false);
    }, FADE_MS + totalProgressMs + END_DELAY_MS);
    timers.push(tEnd);
    return () => { timers.forEach(clearTimeout); };
  }, [loadingSeqStarted]);

  // Start when shader is ready
  useEffect(() => {
    if (shaderReady) startLoadingSequence();
  }, [shaderReady, startLoadingSequence]);

  // Fallback: start quickly even if shaderReady didn't arrive (keep worst-case < 3s)
  useEffect(() => {
    if (loadingSeqStarted) return;
    const t = setTimeout(() => { startLoadingSequence(); }, 800);
    return () => { clearTimeout(t); };
  }, [loadingSeqStarted, startLoadingSequence]);

  // (No dev toggles in production; fill is scroll-driven only)
  // Manifesto: smoothly fill letters to white as lines pass viewport center
  useEffect(() => {
    // Find all scrollable ancestors for robust scroll listening
    const getScrollParents = (node: HTMLElement | null): (Window | Document | HTMLElement)[] => {
      const res: (Window | Document | HTMLElement)[] = [];
      if (!node) return res;
      let el: HTMLElement | null = node.parentElement;
      while (el) {
        const style = window.getComputedStyle(el);
        const ov = style.overflowY;
        const isScrollable = (ov === 'auto' || ov === 'scroll') && el.scrollHeight > el.clientHeight;
        if (isScrollable) res.push(el);
        el = el.parentElement;
      }
      // Always include document and window as fallbacks
      res.push(document);
      res.push(document.documentElement);
      res.push(document.body);
      res.push(window);
      return Array.from(new Set(res));
    };
    // Determine current scroll position across our scrollers
    const scrollers = getScrollParents(manifestoRef.current);
    // Choose a primary scroller for direction detection (prefer nearest scrollable ancestor; fallback to document.scrollingElement or window)
    const primaryScroller = ((): Window | HTMLElement => {
      const firstElem = scrollers.find((s) => (s as HTMLElement).scrollTop != null) as HTMLElement | undefined;
      return firstElem || window;
    })();
    const getPrimaryScroll = () => {
      if ((primaryScroller as HTMLElement).scrollTop != null) return (primaryScroller as HTMLElement).scrollTop || 0;
      return window.scrollY || 0;
    };
    let lastPos = getPrimaryScroll();
    let lastDir: 'down' | 'up' = 'down';
    const DIR_EPS = 2; // px threshold to switch direction to avoid jitter
    const FULL_LOCK = 0.98;   // mark as filled when reaching this
    const RELEASE_AT = 0.08;  // when frontier drops below this, move frontier upward

    function updateManifestoActive() {
      const root = manifestoRef.current;
      if (!root) return;
      const lines = Array.from(root.querySelectorAll('[data-m-line]')) as HTMLElement[];
      if (!lines.length) return;
      // Use viewport center and a per-line radius for consistent feel across sizes
      const viewportCenter = window.innerHeight * 0.5;
      const curPos = getPrimaryScroll();
      const delta = curPos - lastPos;
      const goingDown = delta > DIR_EPS ? true : delta < -DIR_EPS ? false : lastDir === 'down';
      lastDir = goingDown ? 'down' : 'up';
      const fillMax = fillMaxMapRef.current;
      const smoothMap = smoothFillMapRef.current;
      // Precompute geometry
      const geom = lines.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, center: r.top + r.height / 2, h: r.height };
      });
      // Candidate to advance the frontier while going down: line closest to center
      let closest = geom[0];
      for (const g of geom) if (Math.abs(g.center - viewportCenter) < Math.abs(closest.center - viewportCenter)) closest = g;

      // If scrolling up: do not change any fills; keep them at their current maximums
      if (!goingDown) { lastPos = curPos; return; }

      // Evaluate fills (downward only)
      let needsEase = false;
      for (const g of geom) {
        const d = Math.abs(g.center - viewportCenter);
        const radius = Math.max(g.h * 0.8, 110);
        let t = 1 - d / radius; if (t < 0) t = 0; if (t > 1) t = 1;
        const prevMax = fillMax.get(g.el) ?? 0;
        // Keep animation, but ensure we eventually fill to 100%.
        // When the line is close enough to the viewport center, snap target to 1.
        let desired = Math.max(prevMax, t);
        if (t >= 0.96) desired = 1;
        fillMax.set(g.el, desired);
        // Smoothly approach the desired value
        const prevSmooth = smoothMap.get(g.el) ?? 0;
        // Slightly faster easing when we're snapping to 1 to finish the line cleanly
        const k = desired === 1 ? 0.45 : 0.25; // smoothing factor per update
        let smoothed = prevSmooth + (desired - prevSmooth) * k;
        if (smoothed < prevSmooth) smoothed = prevSmooth; // ensure non-decreasing
        if (desired - smoothed > 0.004) needsEase = true;
        smoothMap.set(g.el, smoothed);
        const pct = `${(smoothed * 100).toFixed(1)}%`;
        g.el.style.setProperty('--fill', pct);
        g.el.style.backgroundSize = `${pct} 100%, 100% 100%`;
        g.el.classList.toggle('active', smoothed >= 0.995);
      }
      // Advance frontier for reference (not used on up-scroll anymore)
      const val = fillMax.get(closest.el) ?? 0;
      if (val >= FULL_LOCK) frontierElRef.current = closest.el;
      lastPos = curPos;
      // If still easing needed and last direction is down, schedule another frame
      if (needsEase && lastDir === 'down') {
        requestAnimationFrame(updateManifestoActive);
      }
    }
    updateManifestoActive();
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return; scheduled = true;
      requestAnimationFrame(() => { scheduled = false; updateManifestoActive(); });
    };
    scrollers.forEach((s) => s.addEventListener('scroll', schedule as any, { passive: true } as any));
    window.addEventListener('wheel', schedule, { passive: true } as any);
    window.addEventListener('touchmove', schedule, { passive: true } as any);
    window.addEventListener('resize', schedule);
    return () => {
      try {
        scrollers.forEach((s) => s.removeEventListener('scroll', schedule as any));
      } catch {}
      window.removeEventListener('wheel', schedule as any);
      window.removeEventListener('touchmove', schedule as any);
      window.removeEventListener('resize', schedule as any);
    };
  }, []);

  // Fixed width: measure widest word using the in-DOM sizer to ensure exact metrics
  useLayoutEffect(() => {
    if (isSmall) return; // skip measuring on small screens
    const sizer = verbSizerRef.current;
    if (!sizer) return;
    const original = sizer.textContent;
    let max = 0;
    verbs.forEach(v => {
      sizer.textContent = v;
      // Force a sync layout read
      const w = sizer.getBoundingClientRect().width;
      if (w > max) max = w;
    });
    sizer.textContent = original;
    if (max > 0) setWrapWidth(prev => {
      const next = Math.ceil(max);
      return prev ? Math.max(prev, next) : next;
    });

    // Re-measure after fonts are ready (webfonts can shift metrics)
    const fontsObj: any = (document as any).fonts;
    if (fontsObj && typeof fontsObj.ready?.then === 'function') {
      fontsObj.ready.then(() => {
        const s = verbSizerRef.current;
        if (!s) return;
        const orig = s.textContent;
        let m2 = 0;
        verbs.forEach(v => {
          s.textContent = v;
          const w = s.getBoundingClientRect().width;
          if (w > m2) m2 = w;
        });
        s.textContent = orig;
        if (m2 > 0) setWrapWidth(prev => {
          const next = Math.ceil(m2);
          return prev ? Math.max(prev, next) : next;
        });
      });
    }
  }, []);

  // Word cycle with animation and reduced-motion fallback
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const interval = setInterval(() => {
      const next = (idx + 1) % verbs.length;
      if (mq.matches) {
        setIdx(next);
        return;
      }
      // Start outgoing
      setAnim({ stage: 'out', next });
      // Activate incoming slightly later for overlap
      const tIn = setTimeout(() => setIncomingActive(true), 260);
      // Finalize after incoming finishes
      const tDone = setTimeout(() => {
        setIdx(next);
        setAnim({ stage: 'idle', next: null });
        setIncomingActive(false);
        setTick(t => t + 1);
      }, 1320); // finalize after last staggered letter (~260ms + 5*28ms + 900ms + slack)
      return () => {
        clearTimeout(tIn); clearTimeout(tDone);
      };
    }, 3000);
    return () => clearInterval(interval);
  }, [idx, isSmall]);

  // Bubble follow + click grow
  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;
    let raf = 0;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    function onMove(e: PointerEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
    }
    function onClick() {
      setClicked(true);
      setTimeout(() => setClicked(false), 180);
    }
    function tick() {
      // ease follow
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      bubble.style.setProperty('--x', pos.x + 'px');
      bubble.style.setProperty('--y', pos.y + 'px');
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('click', onClick);
    raf = requestAnimationFrame(tick);
    return () => {
      try { cancelAnimationFrame(raf); } catch {}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);
  return (
    <main id="top" ref={mainRef} className={`${styles.main} ${loading ? styles.noCursor : ''}`}>

      <section ref={heroRef} className={styles.hero}>
        {/* Top-left brand title (always mounted; hidden during loading) */}
        <a
          ref={brandRef as any}
          href="/"
          onClick={onBackToTopClick}
          className={[styles.brandTitle, loading ? styles.hideWhileLoading : ''].filter(Boolean).join(' ')}
        >
          Fater AI
        </a>
        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          className={[styles.hamburgerBtn, mobileMenuOpen ? styles.hamburgerOpen : '', loading ? styles.hideWhileLoading : ''].filter(Boolean).join(' ')}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen ? 'true' : 'false'}
          aria-controls="mobile-menu"
          onClick={onToggleMenu}
        >
          <span className={styles.hamburgerIcon} aria-hidden>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </span>
        </button>
        <div className={[styles.heroCanvasWrap, loading ? styles.canvasHidden : ''].filter(Boolean).join(' ')}>
          <HeroCanvas phase={phase} onReady={() => setShaderReady(true)} />
        </div>
        <div
          className={[
            styles.shaderCover,
            // Keep pure black while loading; only fade cover after loading ends
            !loading ? styles.shaderCoverReady : '',
          ].filter(Boolean).join(' ')}
          aria-hidden
        />
        {/* Minimal loading UI: number + spinning logo over pure black cover */}
        {SHOW_LOADING_UI && loading && (
          <div className={styles.loadingOverlay} aria-live="polite">
            <div className={styles.loadingInner}>
              <div className={styles.loadingStack}>
                <div className={styles.loadingLayer}>
                  <div className={styles.loadingGroup}>
                    {showNumber && (
                      <div className={`${styles.loadingNumber} ${styles.dissolveIn}`}>
                        <span>{progress || 0}</span>
                      </div>
                    )}
                    {showLogo && (
                      <div className={`${styles.loadingLogo} ${styles.dissolveIn}`} aria-hidden>
                        <img className={styles.loadingLogoSpin} src="/fater-ai-logo-white.png" alt="" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      <div className={`${styles.heroContent} ${loading ? styles.heroHidden : styles.heroVisible}`}>
        <div className={styles.heroStack}>
          <h1 ref={h1Ref} className={`${styles.revealUp} ${styles.heroTitle}`}>
            We help you build the world with AI.
          </h1>
          <a
            className={`${styles.partnersCta} ${styles.heroCta}`}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span>Request access</span>
          </a>
          </div>
        </div>
        {/* Right-side vertical nav (always mounted; hidden during loading) */}
        <nav
          ref={sideNavRef}
          className={[styles.sideNav, loading ? styles.hideWhileLoading : ''].filter(Boolean).join(' ')}
          aria-label="Section navigation"
        >
          <a href="/blog">BLOG</a>
          <a href="#manifesto" onClick={(e) => onNavClick(e, 'manifesto')}>MANIFESTO</a>
          <a href="#partners" onClick={(e) => onNavClick(e, 'partners')}>PARTNERS</a>
          <a href="#contact" onClick={(e) => onNavClick(e, 'contact')}>CONTACT</a>
        </nav>
        {/* Mobile full-screen menu */}
        {(mobileMenuOpen || menuClosing) && (
          <div
            id="mobile-menu"
            className={[
              styles.mobileMenu,
              menuClosing ? styles.mobileMenuClosing : styles.mobileMenuEntering
            ].join(' ')}
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) closeMenu(); }}
          >
            {/* Mobile navigation mirrors desktop sideNav */}
            <nav className={styles.mobileNav} aria-label="Mobile navigation">
              <a href="/blog" onClick={() => closeMenu()}>BLOG</a>
              <a href="#manifesto" onClick={(e) => onNavAndClose(e, 'manifesto')}>MANIFESTO</a>
              <a href="#partners" onClick={(e) => onNavAndClose(e, 'partners')}>PARTNERS</a>
              <a href="#contact" onClick={(e) => onNavAndClose(e, 'contact')}>CONTACT</a>
            </nav>

            {/* Bottom contact row */}
            <div className={styles.mobileContact}>
              <span className={styles.contactArrow} aria-hidden>→</span>
              <a href="mailto:team@fater.ai" className={styles.contactEmail}>team@fater.ai</a>
            </div>
          </div>
        )}
        {/* Backed by Microsoft badge removed from hero; moved into partners section */}
        {/* Mouse bubble (hidden during loading) */}
        {!loading && (
          <div ref={bubbleRef} className={`${styles.cursorBubble} ${clicked ? styles.clicked : ''}`} />
        )}
        {/* Bottom-left scroll indicator (hidden during loading) */}
        {!loading && (
          <div className={styles.scrollIndicator} aria-hidden>
            <div className={styles.scrollSpinner}>
              <img src="/scroll-down.svg?v=6" alt="" className={styles.scrollImg} />
              <img src="/fater-ai-logo-white.png" alt="" className={styles.scrollCenterLogo} />
            </div>
          </div>
        )}
        {/* Bottom gradient edge to blend hero into next sections */}
        <div className={styles.heroEdge} aria-hidden />
      </section>

      {/* Manifesto section */}
      <section id="manifesto" className={styles.manifestoSection}>
        <div className={styles.manifestoInner}>
          <div className={styles.manifestoKicker}>Manifesto</div>
          <div ref={manifestoRef} className={styles.manifestoLines}>
            {manifestoLinesText.map((item, li) => (
              <div
                key={li}
                className={`${styles.manifestoLine} ${item.bold ? styles.manifestoBold : ''}`}
                data-m-line
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* FAQ section (before news) */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={`${styles.manifestoKicker} ${styles.partnersReveal} ${faqVisible ? styles.isVisible : ''}`}>FAQ</div>
          <div ref={faqRef} className={`${styles.faqGrid} ${styles.partnersReveal} ${faqVisible ? styles.isVisible : ''}`}>
            {faqItems.map((it, i) => {
              const open = faqOpen === i;
              const qId = `faq-q-${i}`;
              const pId = `faq-panel-${i}`;
              return (
                <div className={styles.faqItem} data-open={open ? 'true' : 'false'} key={i}>
                  <button className={styles.faqHeader} aria-expanded={open} aria-controls={pId} onClick={() => onToggleFaq(i)}>
                    <span className={styles.faqIcon} aria-hidden>{open ? '−' : '+'}</span>
                    <span id={qId} className={styles.faqQ}>{it.q}</span>
                  </button>
                  <div id={pId} role="region" aria-labelledby={qId} className={styles.faqPanel}>
                    <div className={styles.faqPanelInner}>{it.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest news section (after manifesto, before partners) */}
      <section id="news" className={styles.newsSection}>
        <div className={styles.newsInner}>
          <div className={`${styles.manifestoKicker} ${styles.partnersReveal} ${newsVisible ? styles.isVisible : ''}`}>Articles</div>
          <div ref={newsRef} className={`${styles.newsGrid} ${styles.partnersReveal} ${newsVisible ? styles.isVisible : ''}`}>
            {newsArticles.map((art, i) => (
              <article className={`${styles.newsCard} ${newsVisible ? styles.cardIn : ''}`} key={i} style={{ ['--stagger' as any]: `${i * 100}ms` }}>
                <Link href={art.url} className={styles.newsLink}>
                  <div className={styles.newsImageWrapper} ref={setNewsImgRef}>
                    <img src={art.image as string} alt="" className={styles.newsImage} />
                  </div>
                  <div className={`${styles.newsMeta} ${styles.newsMetaRow}`}>
                    <span>{formatDate(art.meta) ?? ''}</span>
                    {/* No external logo for internal articles */}
                  </div>
                  <h3 className={styles.newsHeadline}>{art.headline}</h3>
                  {art.description ? (
                    <p className={styles.newsDesc}>{art.description}</p>
                  ) : null}
                  {art.tags && art.tags.length > 0 ? (
                    <div className={styles.newsTags}>
                      {art.tags.map((t: string) => {
                        const nice = t ? t.slice(0,1).toUpperCase() + t.slice(1).toLowerCase() : '';
                        return (
                          <span key={t} className={styles.newsTag}>{nice}</span>
                        );
                      })}
                    </div>
                  ) : null}
                  <span className={styles.newsReadMore}>Read more →</span>
                </Link>
              </article>
            ))}
          </div>
          <div className={styles.newsMoreRow}>
            <a href="/blog" className={styles.newsMoreLink}>Read more →</a>
          </div>
        </div>
      </section>

      {/* Partners section (after manifesto, compact) */}
      <section id="partners" className={`${styles.partnersSection} ${styles.partnersCompact}`}>
        <div className={styles.partnersFade} aria-hidden />
        <div className={styles.partnersContent}>
          <div ref={partnersBlockRef}>
            <div className={`${styles.partnersKicker} ${styles.partnersReveal} ${partnersVisible ? styles.isVisible : ''}`}>Select Enterprise Partners</div>
            <div className={`${styles.partnerLogos} ${partnersVisible ? styles.logosVisible : ''}`}>
              {/* Microsoft (masked for uniform tone) */}
              <span role="img" aria-label="Microsoft" className={styles.partnerLogoMsMask} />
              <Image src={logoNvidia} alt="NVIDIA" className={`${styles.partnerLogo} ${styles.partnerLogoNvidia}`} />
              <Image src={logoAlta} alt="Altarea" className={styles.partnerLogo} />
              <Image src={logoUrw} alt="Unibail-Rodamco-Westfield" className={styles.partnerLogo} />
            </div>
          </div>
        </div>
      </section>

      <Footer mainRef={mainRef} />
    </main>
  );
}
