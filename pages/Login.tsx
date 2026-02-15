import React from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { SEO } from '../components/SEO';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <SEO
        title="Sign In"
        description="Sign in to save and manage your AI prompts"
        noIndex
      />
      <AuthForm />
    </div>
  );
};
