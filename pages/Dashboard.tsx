import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Icons } from '../components/Icons';
import styles from './Dashboard.module.css';

interface Prompt {
  id: string;
  title: string;
  original_idea: string;
  type: string;
  created_at: string;
}

export const Dashboard = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPrompts(data || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getTypeClass = (type: string) => {
    if (type === 'IMAGE') return styles.typeImage;
    if (type === 'VIDEO') return styles.typeVideo;
    return styles.typeText;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icons.Loading className={styles.spinIcon} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Your Dashboard</h1>
            <p className={styles.subtitle}>Manage and organize your generated prompts.</p>
          </div>
          <Link to="/app" className={styles.newBtn}>
            <Icons.Magic className={styles.newBtnIcon} />
            New Prompt
          </Link>
        </header>

        {prompts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIconWrap}>
              <Icons.Sparkles className={styles.emptyIcon} />
            </div>
            <h3 className={styles.emptyTitle}>No prompts yet</h3>
            <p className={styles.emptySub}>
              Create your first AI prompt to see it appear here in your collection.
            </p>
            <Link to="/app" className={styles.emptyLink}>
              Start Creating &rarr;
            </Link>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={styles.grid}
          >
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                variants={item}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.typeBadge} ${getTypeClass(prompt.type)}`}>
                    {prompt.type}
                  </span>
                  <span className={styles.cardDate}>
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>
                  {prompt.title || "Untitled Prompt"}
                </h3>

                <p className={styles.cardIdea}>
                  {prompt.original_idea}
                </p>

                <div className={styles.cardActions}>
                  <button className={styles.copyBtn}>
                    <Icons.Copy className={styles.copyBtnIcon} /> Copy
                  </button>
                  <div className={styles.spacer} />
                  <button className={styles.deleteBtn}>
                    <Icons.Delete className={styles.deleteBtnIcon} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};