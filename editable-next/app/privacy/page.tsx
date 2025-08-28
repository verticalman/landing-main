"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from "../page.module.css";
import Footer from "../../components/Footer";

export default function PrivacyPage() {
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

  // Global background fade (black -> white) driven by footer visibility (same as homepage)
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

  return (
    <main ref={mainRef} className={styles.main}>
      {/* Fixed brand + side nav header (like landing hero) */}
      <a href="/" className={styles.brandTitle}>Fater AI</a>
      <nav className={styles.sideNav} aria-label="Section navigation">
        <a href="/">HOME</a>
        <a href="#contact" onClick={(e) => onNavClick(e, 'contact')}>CONTACT</a>
      </nav>
      {/* Simple header */}
      <section className={styles.manifestoSection}>
        <div className={styles.manifestoInner}>
          <h1 className={styles.newsTitle} style={{ marginBottom: 8 }}>PRIVACY POLICY</h1>
          <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 24 }}>Last updated: June 17, 2025.</div>

          {/* Content body */}
          <div className={`${styles.newsInner} ${styles.neutralLinks}`} style={{ padding: 0 }}>
            <div style={{ display: 'grid', gap: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>1. Information We Collect</h3>
                <p>When you use the contact form on our website, you voluntarily provide us with the following information:</p>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  <li>Full Name – to address you properly.</li>
                  <li>Email Address – to respond to your inquiry.</li>
                  <li>Company Name (optional) – if you wish to identify your organization.</li>
                  <li>Contact Message – the content of your inquiry or request.</li>
                </ul>
                <p style={{ marginTop: 10 }}>We do not automatically collect personal data for analytics or marketing via cookies or tracking technologies.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>2. How We Use Information</h3>
                <p>The information you provide through the contact form is used solely for:</p>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  <li>Responding to your inquiry and communicating about your request.</li>
                  <li>Maintaining the minimal follow‑up necessary to fulfill your request.</li>
                </ul>
                <p style={{ marginTop: 10 }}>FATER AI CORP. will not use your data for marketing, unsolicited newsletters, nor share, sell, or rent it to third parties for commercial purposes.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>3. Data Storage & Retention</h3>
                <p>Messages submitted via our contact form are sent directly to our email inbox. We do not store this information in a site database or CRM.</p>
                <p>We retain your message only as long as needed to process and respond, and for any follow‑up directly related to your inquiry. When it is no longer necessary (e.g., your inquiry is resolved and no project is ongoing), we delete the message from our inbox.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>4. Your Rights</h3>
                <p>You may request access, correction, or deletion of your personal information. To exercise your rights, email us at <a href="mailto:team@fater.ai">team@fater.ai</a>.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>5. Security</h3>
                <p>We take reasonable measures to protect the confidentiality of the data you send us. However, no transmission over the Internet can be guaranteed 100% secure. Please also safeguard access to your own email account.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>6. Third‑Party Services</h3>
                <p>Our website may contain links to third‑party websites not operated by us. Their privacy practices are governed by their own policies, which we encourage you to review.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>7. Changes to This Policy</h3>
                <p>We may update this Policy from time to time. The “Last updated” date at the top will reflect the most recent changes.</p>
              </section>
              <section>
                <h3 style={{ margin: '0 0 8px' }}>8. Contact</h3>
                <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:team@fater.ai">team@fater.ai</a>.</p>
                <p style={{ marginTop: 6 }}>FATER AI CORP., 254 Chapman Road, DE 19702, United States.</p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer mainRef={mainRef} />
    </main>
  );
}
