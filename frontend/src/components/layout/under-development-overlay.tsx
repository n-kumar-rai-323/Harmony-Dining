import Image from 'next/image';

import styles from './under-development-overlay.module.css';

export default function UnderDevelopmentOverlay() {
  return (
    <main className={styles.screen}>
      <div className={styles.notice}>
        <Image
          className={styles.logo}
          src="/images/harmony-logo.jpeg"
          alt="Harmony Dining & Event Center"
          width={88}
          height={88}
          preload
        />
        <h1>Website under development</h1>
        <p>We’re working on the Harmony Dining website. Please check back soon.</p>
      </div>
    </main>
  );
}
