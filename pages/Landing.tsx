import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from '@/components/Icons';
import { SEO } from '@/components/SEO';
import styles from './Landing.module.css';

export const Landing: React.FC = () => {
  return (
    <div className={styles.page}>
      <SEO
        title="AI Prompt Generator"
        description="Create professional-grade AI prompts for Midjourney, ChatGPT, Runway, and more. Transform your ideas into optimized prompts instantly."
      />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={`${styles.logoText} text-gradient-animate`}>PromptCraft AI</span>
          </div>
          <div className={styles.headerActions}>
            <Link to="/login" className={styles.loginLink}>
              Login
            </Link>
            <Link to="/app" className={styles.getStartedLink}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.heroText}
          >
            <h1 className={styles.heroTitle}>
              Generate Pro Prompts in Seconds
            </h1>
            <p className={styles.heroSubtitle}>
              Turn a simple idea into a detailed, model-ready prompt for Midjourney, Runway, ChatGPT, and more.
            </p>
            <div className={styles.heroCta}>
              <Link to="/app" className={styles.ctaPrimary}>
                Get Started
                <Icons.ArrowRight className={styles.ctaPrimaryIcon} />
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Login
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.socialSection}
          >
            <p className={styles.socialLabel}>Connect with me</p>
            <div className={styles.socialLinks}>
              <a
                href="https://instagram.com/aaspandiyar"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.instagramLink}
              >
                <Icons.Instagram className={styles.socialIcon} />
                @aaspandiyar
              </a>
              <a
                href="https://tiktok.com/@.4span"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tiktokLink}
              >
                <Icons.TikTok className={styles.socialIcon} />
                @.4span
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
