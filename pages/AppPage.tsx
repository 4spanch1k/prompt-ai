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
import { ResultSkeleton } from '../components/Skeleton';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Icons.Magic className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-semibold text-zinc-100">PromptCraft AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-100 hidden sm:inline"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/50"
            >
              <Icons.History className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-7xl mx-auto lg:px-4">
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 flex flex-col gap-8 max-w-4xl w-full">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-100">Create Pro-Level Prompts</h2>
            <p className="text-zinc-400 text-sm">
              Describe your idea; we&apos;ll turn it into a detailed prompt for Midjourney, Runway, ChatGPT, and more.
            </p>
          </div>

          <section>
            <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
          </section>

          {error && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-red-950/20 text-red-300 text-sm flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <section ref={resultSectionRef} className="scroll-mt-24">
            {currentResult && currentType !== null ? (
              <ResultCard result={currentResult} type={currentType} />
            ) : !isLoading ? (
              <div className="min-h-64 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                <Icons.Sparkles className="w-10 h-10 mb-4 opacity-50" />
                <p className="font-medium text-zinc-400">Ready to generate</p>
                <p className="text-sm mt-1">Your enhanced prompt will appear here.</p>
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
