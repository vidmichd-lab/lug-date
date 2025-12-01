/**
 * Loading fallback component for Suspense
 */

import styles from './LoadingFallback.module.css';

export function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>Loading...</p>
    </div>
  );
}

