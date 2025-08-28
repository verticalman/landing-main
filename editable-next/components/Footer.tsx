"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../app/page.module.css";
import BubblePicker, { type BubbleOption, type BubblePickerHandle } from "./BubblePicker";

export default function Footer({ mainRef }: { mainRef?: React.RefObject<HTMLElement> }) {
  // Reveal-on-intersect
  const contactRef = useRef<HTMLElement>(null);
  const [contactVisible, setContactVisible] = useState(false);

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

  // Global background fade (black -> white) driven by footer visibility
  useEffect(() => {
    const footer = contactRef.current;
    const mainEl = mainRef?.current ?? null;
    if (!footer || !mainEl) return;
    const thresholds = Array.from({ length: 51 }, (_, i) => i / 50);
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry ? entry.intersectionRatio : 0;
        const eased = Math.min(1, Math.max(0, ratio * 1.1));
        mainEl.style.setProperty("--bgw", String(eased));
      },
      { threshold: thresholds }
    );
    obs.observe(footer);
    return () => { try { obs.disconnect(); } catch {} };
  }, [mainRef]);

  // Smooth scroll back to top
  const onBackToTopClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const topEl = document.getElementById('top');
    if (prefersReduced) {
      if (topEl && topEl.scrollIntoView) {
        try { topEl.scrollIntoView({ behavior: 'auto', block: 'start' }); } catch { try { window.scrollTo(0, 0); } catch {} }
      } else {
        try { window.scrollTo(0, 0); } catch {}
      }
      return;
    }
    // Prefer native smooth scroll to the hero element
    let usedNative = false;
    if (topEl && topEl.scrollIntoView) {
      try { topEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); usedNative = true; } catch {}
    }
    if (!usedNative) {
      try { window.scrollTo({ top: 0, behavior: 'smooth' as ScrollBehavior }); usedNative = true; } catch {}
    }
    // Manual fallback animation if needed
    if (!usedNative) {
      const startY = window.scrollY || window.pageYOffset || 0;
      if (startY > 0) {
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
    // Keep URL clean (avoid leaving #top in the bar if anything set it elsewhere)
    if (location.hash) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch {}
    }
  };

  // Form state and validation
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Industry picker
  const BUBBLE_OPTIONS: BubbleOption[] = useMemo(() => ([
    { label: 'Architecture', value: 'Architecture', colorClass: 'colArchitecture', dotClass: 'dotArchitecture' },
    { label: 'Design', value: 'Design', colorClass: 'colDesign', dotClass: 'dotDesign' },
    { label: 'Construction', value: 'Construction', colorClass: 'colConstruction', dotClass: 'dotConstruction' },
    { label: 'Real Estate', value: 'Real Estate', colorClass: 'colRealEstate', dotClass: 'dotRealEstate' },
    { label: 'Engineering', value: 'Engineering', colorClass: 'colEngineering', dotClass: 'dotEngineering' },
    { label: 'Other', value: 'Other', colorClass: 'colOther', dotClass: 'dotOther' },
  ]), []);
  const [industry, setIndustry] = useState<string>("");
  const industryPickerRef = useRef<BubblePickerHandle>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactError(null);
    setContactSent(false);
    if (contactSubmitting) return;
    setContactSubmitting(true);
    try {
      // Ensure industry is chosen (hidden input not natively validated)
      if (!industry) {
        setContactError('Please select an industry');
        industryPickerRef.current?.open();
        return;
      }
      const formEl = e.currentTarget as HTMLFormElement;
      const fd = new FormData(formEl);
      const payload: Record<string, any> = Object.fromEntries(fd.entries());
      payload.source = 'site-footer';
      const res = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Submit failed (${res.status})`);
      }
      setContactSent(true);
      formEl.reset();
      setIndustry("");
    } catch (err: any) {
      setContactError(err?.message || 'Something went wrong');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <>
      <footer id="contact" className={styles.footerSection} ref={contactRef}>
        <div className={styles.footerInner}>
          <div className={`${styles.partnersReveal} ${contactVisible ? styles.isVisible : ''}`} style={{ transitionDelay: contactVisible ? '40ms' : undefined }}>
            <div className={styles.contactKicker}>Contact</div>
            <h2 className={styles.footerHeadline}>SEND US YOUR QUERY.</h2>
          </div>

          <form
            className={`${styles.contactGrid} ${styles.partnersReveal} ${contactVisible ? styles.isVisible : ''}`}
            style={{ transitionDelay: contactVisible ? '140ms' : undefined }}
            onSubmit={onSubmit}
          >
            <div className={styles.contactLeft}>
              <input className={styles.contactInput} type="text" name="name" placeholder="Full Name" aria-label="Full Name" required />
              <input className={styles.contactInput} type="email" name="email" placeholder="Email Address" aria-label="Email Address" required />
              <input className={styles.contactInput} type="text" name="company" placeholder="Company Name" aria-label="Company Name" required />
              <div
                className={styles.contactInput}
                role="button"
                aria-label="Industry"
                onClick={() => industryPickerRef.current?.toggle()}
                tabIndex={0}
                onKeyDown={(e) => { if ((e as React.KeyboardEvent).key === 'Enter') industryPickerRef.current?.toggle(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}
              >
                <span style={{ color: industry ? '#0d0d0d' : 'var(--placeholder-color, rgba(13,13,13,0.5))' }}>
                  {industry || 'Industry'}
                </span>
                <BubblePicker
                  ref={industryPickerRef}
                  name="industry"
                  options={BUBBLE_OPTIONS}
                  value={industry}
                  onChange={setIndustry}
                  idleLabel=""
                  renderTrigger={false}
                />
              </div>
              <input className={styles.contactInput} type="tel" name="phone" placeholder="Phone number" aria-label="Phone number" required />
              <input className={styles.contactInput} type="url" name="website" placeholder="Website" aria-label="Website" required />
            </div>
            <div className={styles.contactRight}>
              <div className={styles.contactDesc}>
                If you are looking for a team to support you in the development of your project, don’t hesitate to contact us.
                <br /><br />We are available to carry out your project.
              </div>
              <textarea className={styles.contactTextarea} name="message" placeholder="Message" aria-label="Message" required />
              <div className={styles.contactActions}>
                <button type="submit" className={styles.contactSubmit} disabled={contactSubmitting}>
                  {contactSubmitting ? 'SENDING…' : contactSent ? 'SENT ✓' : 'SUBMIT'}
                </button>
                {contactError ? (
                  <span className={styles.contactError} role="alert">{contactError}</span>
                ) : null}
                <a href="#top" className={styles.backToTop} onClick={onBackToTopClick} aria-label="Back to top">Back to top ↑</a>
              </div>
            </div>
          </form>
        </div>
      </footer>
      {/* Footer bottom bar: socials, address, legal */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <nav className={styles.footerSocial} aria-label="Follow us">
            <a href="https://www.instagram.com/thefaterai/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/thefaterai" target="_blank" rel="noreferrer">X</a>
            <a href="https://www.linkedin.com/company/fater-ai/" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
          <div className={styles.footerAddress}>
            254 Chapman Road, DE 19702, United States
          </div>
          <div className={styles.footerLegal}>
            <a href="/privacy">Privacy&nbsp;Policy</a>
            <span aria-hidden>·</span>
            <span>FATER AI CORP. All rights reserved.</span>
          </div>
        </div>
      </div>
    </>
  );
}
