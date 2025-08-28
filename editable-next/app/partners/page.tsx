"use client";

import styles from './page.module.css';
import HeroCanvas from '../../components/HeroCanvas';

export default function PartnersPage() {
  const brands = [
    'Unibail–Rodamco–Westfield', 'Altarea', 'Bouygues Immobilier', 'Vinci Immobilier', 'Eiffage Immobilier',
    'Gecina', 'Nexity', 'Klépierre', 'Hammerson', 'Canary Wharf Group',
    'Brookfield Properties', 'Hines', 'Skanska', 'Lendlease', 'Tishman Speyer',
    'Related', 'UrbanAxis Partners', 'ArchiCore Developments', 'TerraForma Group', 'Meridian Estates'
  ];

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <HeroCanvas />
        <div className={styles.heroContent}>
          <div>
            <div className={styles.kicker}>They trust us</div>
            <h1 className={styles.partners}>
              {brands.join(', ')}.
            </h1>
            <div className={styles.dot} aria-hidden />
            <a className={styles.cta} href="/#work">
              <span className={styles.arrow}>→</span>
              <span>More projects</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
