import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedResult, TargetModelType } from '../types';
import { Icons } from './Icons';
import { CopyButton } from './CopyButton';
import { toast } from 'sonner';

interface ResultCardProps {
  result: EnhancedResult;
  type: TargetModelType;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, type }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const copyToClipboard = async (text: string, isNegative = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isNegative) {
        setCopiedNegative(true);
        toast.success('Negative prompt copied');
        setTimeout(() => setCopiedNegative(false), 2000);
      } else {
        setCopiedPrompt(true);
        toast.success('Prompt copied to clipboard');
        setTimeout(() => setCopiedPrompt(false), 2000);
      }
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden"
    >
      <div className="h-px bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700" />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">{result.title}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.suggestedTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-md border border-zinc-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-2 bg-zinc-800/80 rounded-lg border border-zinc-700 shrink-0">
            {type === TargetModelType.IMAGE && <Icons.Image className="w-5 h-5 text-violet-400" />}
            {type === TargetModelType.VIDEO && <Icons.Video className="w-5 h-5 text-pink-400" />}
            {type === TargetModelType.TEXT && <Icons.Text className="w-5 h-5 text-blue-400" />}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Icons.Sparkles className="w-3 h-3" />
              Optimized Prompt
            </span>
            <CopyButton
              copied={copiedPrompt}
              onCopy={() => copyToClipboard(result.optimizedPrompt)}
            />
          </div>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans focus-within:ring-1 focus-within:ring-white">
            {result.optimizedPrompt}
          </pre>
        </div>

        {result.negativePrompt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Negative Prompt
              </span>
              <CopyButton
                copied={copiedNegative}
                onCopy={() => copyToClipboard(result.negativePrompt!, true)}
              />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <p className="text-zinc-400 text-sm leading-relaxed">{result.negativePrompt}</p>
            </div>
          </div>
        )}

        <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800/50">
          <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
            <Icons.Magic className="w-4 h-4 text-zinc-400" />
            AI Logic
          </h3>
          <p className="text-zinc-400 text-sm italic">&ldquo;{result.explanation}&rdquo;</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
