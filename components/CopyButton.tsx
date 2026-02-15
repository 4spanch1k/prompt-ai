import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

interface CopyButtonProps {
  onCopy: () => void;
  copied: boolean;
  label?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  onCopy,
  copied,
  label = 'Copy',
  className = '',
}) => (
  <button
    type="button"
    onClick={onCopy}
    className={`inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded px-2 py-1 ${className}`}
  >
    <AnimatePresence mode="wait">
      {copied ? (
        <motion.span
          key="check"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="text-emerald-400"
        >
          <Icons.Check className="w-3.5 h-3.5" />
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Icons.Copy className="w-3.5 h-3.5" />
        </motion.span>
      )}
    </AnimatePresence>
    <span>{copied ? 'Copied' : label}</span>
  </button>
);
