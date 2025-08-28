"use client";

import React, { useEffect, useRef, useState } from 'react';
import pageStyles from "../../page.module.css";
import blogStyles from "../blog.module.css";
import type { Post } from "../posts";

export default function PostClient({ post, html }: { post: Post; html?: string }) {
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

  // Footer reveal + background fade copied from privacy page
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

  return (
    <main ref={mainRef} className={pageStyles.main}>
      {/* Header copied from privacy page */}
      <a href="/" className={pageStyles.brandTitle}>Fater AI</a>
      <nav className={pageStyles.sideNav} aria-label="Section navigation">
        <a href="/">HOME</a>
        <a href="#contact" onClick={(e) => onNavClick(e, 'contact')}>CONTACT</a>
      </nav>

      {/* Post body */}
      <section className={pageStyles.manifestoSection}>
        <div className={pageStyles.manifestoInner}>
          <article>
            <header>
              <div style={{ marginBottom: 10 }}>
                <a href="/blog" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 13, textDecoration: 'none', color: 'rgba(255,255,255,0.85)'
                }} aria-label="Back to blog">
                  ← Back to blog
                </a>
              </div>
              <h1 style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 8 }}>{post.title}</h1>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
                {!!post.tags?.length && (
                  <span> · {post.tags.join(', ')}</span>
                )}
              </div>
              <p style={{ fontSize: 18, opacity: 0.9 }}>{post.description}</p>
            </header>
            <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image || '/news-1.jpg'}
                alt={post.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.endsWith('nvidia-inception.jpg')) {
                    img.src = '/nvidia-inception.png';
                  } else {
                    img.src = '/news-1.jpg';
                  }
                }}
              />
            </div>
            {html ? (
              <section
                className={blogStyles.markdown}
                style={{ marginTop: 20 }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <section className={blogStyles.markdown} style={{ marginTop: 20 }}>
                {(post.content || []).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </section>
            )}
            {/* Microsoft article composition — end of article content */}
            {post.slug === 'microsoft-france-genai-studio' && (
              <MicrosoftComposition />
            )}
            {/* Author signature */}
            <div className={blogStyles.authorSig}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/yg-ceo.jpeg" alt="Author avatar" className={blogStyles.authorAvatar} />
              <span>Youssef Guessous — CEO</span>
            </div>
          </article>
        </div>
      </section>

      {/* Footer copied from privacy page */}
      <footer id="contact" className={pageStyles.footerSection} ref={contactRef as any}>
        <div className={pageStyles.footerInner}>
          <div className={`${pageStyles.partnersReveal} ${contactVisible ? pageStyles.isVisible : ''}`} style={{ transitionDelay: contactVisible ? '40ms' : undefined }}>
            <div className={pageStyles.contactKicker}>Contact</div>
            <h2 className={pageStyles.footerHeadline}>SEND US YOUR QUERY.</h2>
          </div>

          <form className={`${pageStyles.contactGrid} ${pageStyles.partnersReveal} ${contactVisible ? pageStyles.isVisible : ''}`} style={{ transitionDelay: contactVisible ? '140ms' : undefined }} onSubmit={(e) => { e.preventDefault(); const mail = 'mailto:team@fater.ai'; if (typeof window !== 'undefined') window.location.href = mail; }}>
            <div className={pageStyles.contactLeft}>
              <input className={pageStyles.contactInput} type="text" name="name" placeholder="Full Name" aria-label="Full Name" />
              <input className={pageStyles.contactInput} type="email" name="email" placeholder="Email Address" aria-label="Email Address" />
              <input className={pageStyles.contactInput} type="text" name="company" placeholder="Company Name" aria-label="Company Name" />
            </div>
            <div className={pageStyles.contactRight}>
              <div className={pageStyles.contactDesc}>
                If you are looking for a team to support you in the development of your project, don’t hesitate to contact us.
                <br /><br />We are available to carry out your project.
              </div>
              <textarea className={pageStyles.contactTextarea} name="message" placeholder="Message" aria-label="Message" />
              <div className={pageStyles.contactActions}>
                <button type="submit" className={pageStyles.contactSubmit}>SUBMIT</button>
                <a href="#" className={pageStyles.backToTop} onClick={onBackToTopClick} aria-label="Back to top">Back to top ↑</a>
              </div>
            </div>
          </form>
        </div>
      </footer>

      <div className={pageStyles.footerBottom}>
        <div className={pageStyles.footerBottomInner}>
          <nav className={pageStyles.footerSocial} aria-label="Follow us">
            <a href="https://www.instagram.com/thefaterai/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/thefaterai" target="_blank" rel="noreferrer">X</a>
            <a href="https://www.linkedin.com/company/fater-ai/" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
          <div className={pageStyles.footerAddress}>254 Chapman Road, DE 19702, United States</div>
          <div className={pageStyles.footerLegal}>
            <a href="/privacy">Privacy&nbsp;Policy</a>
            <span aria-hidden>·</span>
            <span>FATER AI CORP. All rights reserved.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function MicrosoftComposition() {
  return (
    <figure className={blogStyles.composition} aria-label="Microsoft article photo">
      <div className={blogStyles.singleFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/TEAM.png" alt="Team group photo" className={blogStyles.singleImg} />
      </div>
    </figure>
  );
}
