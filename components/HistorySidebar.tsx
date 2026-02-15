import React from 'react';
import { HistoryItem, TargetModelType } from '../types';
import { Icons } from './Icons';
import { Skeleton } from './Skeleton';

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
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-zinc-950 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:static lg:h-auto lg:w-80 lg:shrink-0 lg:border-l lg:border-zinc-800 lg:bg-zinc-950/50 lg:shadow-none`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Icons.History className="w-4 h-4 text-zinc-400" />
              History
            </h3>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Icons.Delete className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <p className="text-sm">No prompts yet.</p>
                <p className="text-xs mt-1">Generate one in the main area.</p>
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
                  className="w-full text-left bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 transition-all focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        item.type === TargetModelType.IMAGE
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                          : item.type === TargetModelType.VIDEO
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-200 line-clamp-1 mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2">{item.originalIdea}</p>
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
