import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import HistorySidebar from '../components/HistorySidebar';
import { Icons } from '../components/Icons';
import { PromptOptimizer } from '../components/PromptOptimizer';
import { toast } from 'sonner';
import styles from './AppPage.module.css';

export const AppPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setHistoryLoading(true);
      try {
        const { fetchPrompts } = await import('../services/promptsService');
        const list = await fetchPrompts(user.id);
        setHistory(list);
      } catch (e) {
        console.error('Failed to load prompts', e);
        toast.error('Failed to load history');
      } finally {
        setHistoryLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleHistorySelect = (item: HistoryItem) => {
    // Copy the selected prompt to clipboard
    navigator.clipboard.writeText(item.optimizedPrompt).then(() => {
      toast.success('Prompt copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const clearHistory = () => {
    if (confirm('Clear local list? Saved prompts in the cloud will remain.')) {
      setHistory([]);
      toast.success('List cleared');
    }
  };

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
            <PromptOptimizer />
          </section>
        </main>

        <HistorySidebar
          history={history}
          onSelect={handleHistorySelect}
          onClear={clearHistory}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          loading={historyLoading}
        />
      </div>
    </div>
  );
};
