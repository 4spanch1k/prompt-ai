import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email.trim(), password);
        if (error) throw error;
        toast.success('Account created! Welcome to PromptCraft.');
        navigate('/app', { replace: true });
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        toast.success('Welcome back.');
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Icons.Magic className="w-5 h-5" />
            <span className="font-semibold">PromptCraft AI</span>
          </Link>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-zinc-100 mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            {isSignUp ? 'Sign up with your email.' : 'Sign in to continue.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-zinc-100 text-zinc-900 font-medium text-sm hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Icons.Loading className="w-4 h-4 animate-spin inline" />
                  {isSignUp ? 'Creating...' : 'Signing in...'}
                </span>
              ) : (
                isSignUp ? 'Sign up' : 'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-zinc-300 hover:text-zinc-100 underline underline-offset-2"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
