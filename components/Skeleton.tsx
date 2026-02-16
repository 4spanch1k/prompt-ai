import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div
    className={`${styles.skeleton} ${className}`}
    style={style}
    aria-hidden
  />
);

export const ResultSkeleton: React.FC = () => (
  <div className={styles.resultSkeleton}>
    <div className={styles.resultSkeletonLine} />
    <div className={styles.resultSkeletonBody}>
      <div className={styles.resultSkeletonGroup}>
        <Skeleton style={{ height: '1.5rem', width: '12rem' }} />
        <div className={styles.resultSkeletonTags}>
          <Skeleton style={{ height: '1.25rem', width: '4rem', borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: '1.25rem', width: '5rem', borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: '1.25rem', width: '3.5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
      <div className={styles.resultSkeletonGroup}>
        <Skeleton style={{ height: '1rem', width: '8rem' }} />
        <Skeleton style={{ height: '6rem', width: '100%' }} />
      </div>
      <div className={styles.resultSkeletonGroup}>
        <Skeleton style={{ height: '1rem', width: '6rem' }} />
        <Skeleton style={{ height: '4rem', width: '100%' }} />
      </div>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className={styles.cardSkeleton}>
    <div className={styles.cardSkeletonRow}>
      <Skeleton style={{ height: '1rem', width: '5rem' }} />
      <Skeleton style={{ height: '1rem', width: '3rem' }} />
    </div>
    <Skeleton style={{ height: '1.25rem', width: '100%' }} />
    <Skeleton style={{ height: '1rem', width: '75%' }} />
  </div>
);
