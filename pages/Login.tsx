import React from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { SEO } from '../components/SEO';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  return (
    <main className={styles.page}>
      <SEO
        title="Sign In"
        description="Sign in to save and manage your AI prompts"
        noIndex
      />
      <AuthForm />
    </main>
  );
};
