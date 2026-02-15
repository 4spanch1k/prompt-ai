import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from '../components/Icons';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100">PromptCraft AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/app"
              className="text-sm bg-zinc-100 text-zinc-900 font-medium px-4 py-2 rounded-lg hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all"
            >
              Get Started
            </Link>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-900 font-medium hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
              >
                Get Started
                <Icons.ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all"
              >
                Login
              </Link>
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
              >
                <Icons.Instagram className="w-4 h-4" />
                @aaspandiyar
              </a>
              <a
                href="https://tiktok.com/@.4span"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium hover:bg-zinc-700 hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
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
