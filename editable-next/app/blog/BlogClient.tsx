"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import pageStyles from "../page.module.css";
import Footer from "../../components/Footer";
import styles from './blog.module.css';
import { getFeaturedPosts, getNonFeaturedPosts } from './posts';

export default function BlogClient() {
  const onBackToTopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { target.scrollIntoView(); }
  };

  // Match homepage contact reveal behavior
  const contactRef = useRef<HTMLElement>(null);
  const [contactVisible, setContactVisible] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
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

  // Global background fade (black -> white) driven by footer visibility (same as homepage/privacy)
  useEffect(() => {
    const footer = contactRef.current;
    const mainEl = mainRef.current as HTMLElement | null;
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

  const [featuredA, featuredB] = getFeaturedPosts();
  const rest = getNonFeaturedPosts();

  return (
    <main ref={mainRef} className={pageStyles.main}>
      {/* Fixed brand + side nav header (exactly like privacy page) */}
      <a href="/" className={pageStyles.brandTitle}>Fater AI</a>
      <nav className={pageStyles.sideNav} aria-label="Section navigation">
        <a href="/">HOME</a>
        <a href="#contact" onClick={(e) => onNavClick(e, 'contact')}>CONTACT</a>
      </nav>

      {/* Blog content wrapper */}
      <section className={pageStyles.manifestoSection}>
        <div className={pageStyles.manifestoInner}>
          <div className={styles.header}>
            <h1 className={styles.title}>Fater Blog</h1>
            <p className={styles.subtitle}>Applied AI for the built world — computer vision, generative design, and real‑estate ops.</p>
          </div>

          {/* Featured (two items) */}
          <h3 className={styles.sectionKicker}>Featured</h3>
          <div className={styles.featuredGrid}>
          {featuredA && (
            <article className={styles.featured}>
              <Link className={styles.featuredLink} href={`/blog/${featuredA.slug}`}>
                <div className={styles.featuredMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredA.image || '/news-1.jpg'}
                    alt={featuredA.title}
                    className={styles.featuredImg}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/news-1.jpg'; }}
                  />
                </div>
                <div className={styles.featuredBody}>
                  <div className={styles.metaRow}>
                    {new Date(featuredA.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className={styles.featuredTitle}>{featuredA.title}</h2>
                  <p className={styles.featuredDesc}>{featuredA.description}</p>
                  {!!featuredA.tags?.length && (
                    <div className={styles.tags}>
                      {featuredA.tags.map((t) => (
                        <span className={styles.tag} key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                  <span className={styles.readCta}>Read article →</span>
                </div>
              </Link>
            </article>
          )}
          {featuredB && (
            <article className={styles.featured}>
              <Link className={styles.featuredLink} href={`/blog/${featuredB.slug}`}>
                <div className={styles.featuredMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredB.image || '/news-1.jpg'}
                    alt={featuredB.title}
                    className={styles.featuredImg}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/news-1.jpg'; }}
                  />
                </div>
                <div className={styles.featuredBody}>
                  <div className={styles.metaRow}>
                    {new Date(featuredB.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className={styles.featuredTitle}>{featuredB.title}</h2>
                  <p className={styles.featuredDesc}>{featuredB.description}</p>
                  {!!featuredB.tags?.length && (
                    <div className={styles.tags}>
                      {featuredB.tags.map((t) => (
                        <span className={styles.tag} key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                  <span className={styles.readCta}>Read article →</span>
                </div>
              </Link>
            </article>
          )}
          </div>

          {/* All articles */}
          <h3 className={styles.sectionKicker}>All our articles</h3>
          <div className={styles.gridCards}>
            {rest.map((p) => (
              <article key={p.slug} className={styles.card2}>
                <Link className={styles.card2Link} href={`/blog/${p.slug}`}>
                  <div className={styles.card2Media}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || '/news-2.jpg'}
                      alt={p.title}
                      className={styles.card2Img}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/news-2.jpg'; }}
                    />
                  </div>
                  <div className={styles.card2Body}>
                    <div className={styles.metaRow}>
                      {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h2 className={styles.title2}>{p.title}</h2>
                    <p className={styles.desc}>{p.description}</p>
                    {!!p.tags?.length && (
                      <div className={styles.tags}>
                        {p.tags.map((t) => (
                          <span className={styles.tag} key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                    <span className={styles.readCta}>Read article →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer mainRef={mainRef} />
    </main>
  );
}
