import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LocalHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import HistorySidebar from '../components/HistorySidebar';
import { Icons } from '../components/Icons';
import { PromptOptimizer } from '../components/PromptOptimizer';
import { toast } from 'sonner';
import styles from './AppPage.module.css';

const STORAGE_KEY = 'promptcraft_history';
const MAX_HISTORY = 50;

function loadFromStorage(): LocalHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: LocalHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

export const AppPage: React.FC = () => {
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPositive, setSelectedPositive] = useState('');
  const [selectedNegative, setSelectedNegative] = useState('');
  const { user } = useAuth();

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadFromStorage());
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (history.length > 0) {
      saveToStorage(history);
    }
  }, [history]);

  /** Called by PromptOptimizer after successful generation */
  const handleGenerateSuccess = useCallback(
    (original: string, positive: string, negative: string) => {
      const newItem: LocalHistoryItem = {
        id: crypto.randomUUID(),
        original,
        positive,
        negative,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev].slice(0, MAX_HISTORY));
    },
    [],
  );

  /** Restore prompts from history item */
  const handleHistorySelect = useCallback((item: LocalHistoryItem) => {
    setSelectedPositive(item.positive);
    setSelectedNegative(item.negative);
    toast.success('Prompt restored from history');
  }, []);

  const clearHistory = useCallback(() => {
    if (confirm('Clear all prompt history?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('History cleared');
    }
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoBox}>
              <Icons.Magic className={styles.logoBoxIcon} />
            </div>
            <span className={`${styles.logoText} text-gradient-animate`}>PromptCraft AI</span>
          </Link>
          <nav className={styles.headerNav}>
            <Link to="/dashboard" className={styles.dashboardLink}>
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={styles.historyBtn}
            >
              <Icons.History className={styles.historyBtnIcon} />
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.mainContent}>
          <div className={styles.intro}>
            <h2 className={styles.introTitle}>Create Pro-Level Prompts</h2>
            <p className={styles.introDesc}>
              Describe your idea; we&apos;ll turn it into a detailed prompt for Midjourney, Runway, ChatGPT, and more.
            </p>
          </div>

          <section>
            <PromptOptimizer
              onGenerateSuccess={handleGenerateSuccess}
              restoredPositive={selectedPositive}
              restoredNegative={selectedNegative}
            />
          </section>
        </main>

        <HistorySidebar
          history={history}
          onSelect={handleHistorySelect}
          onClear={clearHistory}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        />
      </div>
    </div>
  );
};
