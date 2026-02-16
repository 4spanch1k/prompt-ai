import React from 'react';
import { LocalHistoryItem } from '../types';
import { Icons } from './Icons';
import styles from './HistorySidebar.module.css';

interface HistorySidebarProps {
  history: LocalHistoryItem[];
  onSelect: (item: LocalHistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onSelect,
  onClear,
  isOpen,
  onToggle,
}) => {
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
            {history.length === 0 ? (
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
                    <span className={styles.itemTime}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={styles.itemIdea}>{item.original}</p>
                  <p className={styles.itemPositive}>
                    {item.positive.length > 80
                      ? item.positive.slice(0, 80) + '…'
                      : item.positive}
                  </p>
                  {item.negative && (
                    <p className={styles.itemNegative}>
                      ⛔ {item.negative.length > 50
                        ? item.negative.slice(0, 50) + '…'
                        : item.negative}
                    </p>
                  )}
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
