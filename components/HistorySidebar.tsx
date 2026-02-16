import React from 'react';
import { HistoryItem, TargetModelType } from '../types';
import { Icons } from './Icons';
import { Skeleton } from './Skeleton';
import styles from './HistorySidebar.module.css';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  loading?: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onSelect,
  onClear,
  isOpen,
  onToggle,
  loading = false,
}) => {
  const getTypeClass = (type: TargetModelType) => {
    if (type === TargetModelType.IMAGE) return styles.typeImage;
    if (type === TargetModelType.VIDEO) return styles.typeVideo;
    return styles.typeText;
  };

  return (
    <>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onToggle}
          aria-hidden
        />
      )}

      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              <Icons.History className={styles.titleIcon} />
              History
            </h3>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className={styles.clearBtn}
              >
                <Icons.Delete className={styles.clearIcon} /> Clear
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.skeletonList}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} style={{ height: '5rem', width: '100%' }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No prompts yet.</p>
                <p className={styles.emptySub}>Generate one in the main area.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={styles.item}
                >
                  <div className={styles.itemHeader}>
                    <span className={`${styles.typeBadge} ${getTypeClass(item.type)}`}>
                      {item.type}
                    </span>
                    <span className={styles.itemTime}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemIdea}>{item.originalIdea}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
