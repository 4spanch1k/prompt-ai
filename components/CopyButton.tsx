import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';
import styles from './CopyButton.module.css';

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
    className={`${styles.button} ${className}`}
  >
    <AnimatePresence mode="wait">
      {copied ? (
        <motion.span
          key="check"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={styles.iconCopied}
        >
          <Icons.Check style={{ width: '0.875rem', height: '0.875rem' }} />
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Icons.Copy style={{ width: '0.875rem', height: '0.875rem' }} />
        </motion.span>
      )}
    </AnimatePresence>
    <span>{copied ? 'Copied' : label}</span>
  </button>
);
