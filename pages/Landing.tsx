import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <SEO
        title="AI Prompt Generator"
        description="Create professional-grade AI prompts for Midjourney, ChatGPT, Runway, and more. Transform your ideas into optimized prompts instantly."
      />
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gradient-animate">PromptCraft AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white">
              <Link to="/login">
                Login
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-white text-zinc-900 hover:bg-zinc-200 transition-all">
              <Link to="/app">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 tracking-tight leading-tight">
              Generate Pro Prompts in Seconds
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Turn a simple idea into a detailed, model-ready prompt for Midjourney, Runway, ChatGPT, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 justify-center pt-2">
              <Button size="lg" asChild className="min-h-[48px] px-6 py-3.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
                <Link to="/app">
                  Get Started
                  <Icons.ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="min-h-[48px] px-6 py-3.5 rounded-lg text-white border border-white/20 hover:bg-white/10 hover:text-white">
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl text-center"
          >
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Connect with me</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://instagram.com/aaspandiyar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all min-h-[48px]"
              >
                <Icons.Instagram className="w-4 h-4" />
                @aaspandiyar
              </a>
              <a
                href="https://tiktok.com/@.4span"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium hover:bg-zinc-700 hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all min-h-[48px]"
              >
                <Icons.TikTok className="w-4 h-4" />
                @.4span
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
