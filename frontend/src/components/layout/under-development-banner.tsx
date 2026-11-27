import styles from './under-development-banner.module.css';

export default function UnderDevelopmentBanner() {
  return (
    <aside className={styles.banner} aria-label="Website notice">
      <strong>Website under development.</strong> You can still browse the site.
    </aside>
  );
}
