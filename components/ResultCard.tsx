import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedResult, TargetModelType } from '../types';
import { Icons } from './Icons';
import { CopyButton } from './CopyButton';
import { toast } from 'sonner';
import styles from './ResultCard.module.css';

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
      className={styles.card}
    >
      <div className={styles.topLine} />
      <div className={styles.body}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{result.title}</h2>
            <div className={styles.tags}>
              {result.suggestedTags.map((tag, i) => (
                <span key={i} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.typeIcon}>
            {type === TargetModelType.IMAGE && <Icons.Image className={`${styles.typeIconSvg} ${styles.violet}`} />}
            {type === TargetModelType.VIDEO && <Icons.Video className={`${styles.typeIconSvg} ${styles.pink}`} />}
            {type === TargetModelType.TEXT && <Icons.Text className={`${styles.typeIconSvg} ${styles.blue}`} />}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>
              <Icons.Sparkles className={styles.sectionLabelIcon} />
              Optimized Prompt
            </span>
            <CopyButton
              copied={copiedPrompt}
              onCopy={() => copyToClipboard(result.optimizedPrompt)}
            />
          </div>
          <pre className={styles.promptBox}>
            {result.optimizedPrompt}
          </pre>
        </div>

        {result.negativePrompt && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>
                Negative Prompt
              </span>
              <CopyButton
                copied={copiedNegative}
                onCopy={() => copyToClipboard(result.negativePrompt!, true)}
              />
            </div>
            <div className={styles.negativeBox}>
              <p className={styles.negativeText}>{result.negativePrompt}</p>
            </div>
          </div>
        )}

        <div className={styles.aiLogic}>
          <h3 className={styles.aiLogicTitle}>
            <Icons.Magic className={styles.aiLogicIcon} />
            AI Logic
          </h3>
          <p className={styles.aiLogicText}>&ldquo;{result.explanation}&rdquo;</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
