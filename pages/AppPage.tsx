import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PromptOptions, EnhancedResult, HistoryItem, TargetModelType } from '../types';
import { generateEnhancedPrompt } from '../services/geminiService';
import { savePrompt } from '../services/promptsService';
import { useAuth } from '../context/AuthContext';
import PromptForm from '../components/PromptForm';
import ResultCard from '../components/ResultCard';
import HistorySidebar from '../components/HistorySidebar';
import { Icons } from '../components/Icons';
import { PromptOptimizer } from '../components/PromptOptimizer';
import { ResultSkeleton } from '../components/Skeleton';
import { toast } from 'sonner';
import styles from './AppPage.module.css';

export const AppPage: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<EnhancedResult | null>(null);
  const [currentType, setCurrentType] = useState<TargetModelType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const openPrompt = (location.state as { openPrompt?: HistoryItem })?.openPrompt;

  useEffect(() => {
    if (openPrompt) {
      setCurrentResult(openPrompt);
      setCurrentType(openPrompt.type);
    }
  }, [openPrompt]);

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

  const handleGenerate = async (options: PromptOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateEnhancedPrompt(options);
      setCurrentResult(result);
      setCurrentType(options.targetModel);

      const newItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
        ...result,
        originalIdea: options.baseIdea,
        type: options.targetModel,
      };

      if (user) {
        const saved = await savePrompt(user.id, newItem);
        setHistory((prev) => [saved, ...prev]);
        toast.success('Prompt saved');
      } else {
        const fallback: HistoryItem = {
          ...newItem,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };
        setHistory((prev) => [fallback, ...prev]);
      }

      if (window.innerWidth < 768) {
        setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentResult(item);
    setCurrentType(item.type);
    setError(null);
    if (window.innerWidth < 768) {
      setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
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

          <section>
            <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
          </section>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorLabel}>Error:</span> {error}
            </div>
          )}

          <section ref={resultSectionRef} className={styles.resultSection}>
            {currentResult && currentType !== null ? (
              <ResultCard result={currentResult} type={currentType} />
            ) : !isLoading ? (
              <div className={styles.emptyResult}>
                <Icons.Sparkles className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>Ready to generate</p>
                <p className={styles.emptySub}>Your enhanced prompt will appear here.</p>
              </div>
            ) : null}
            {isLoading && !currentResult && (
              <ResultSkeleton />
            )}
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
