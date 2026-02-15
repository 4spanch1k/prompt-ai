import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Icons } from '../../components/Icons';

interface Prompt {
  id: string;
  title: string;
  original_idea: string;
  type: string;
  created_at: string;
}

const Dashboard = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Icons.Loading className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-zinc-400 mt-2">Manage and organize your generated prompts.</p>
          </div>
          <Link
            to="/app"
            className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Icons.Magic className="w-4 h-4" />
            New Prompt
          </Link>
        </header>

        {prompts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <div className="bg-zinc-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Sparkles className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No prompts yet</h3>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
              Create your first AI prompt to see it appear here in your collection.
            </p>
            <Link
              to="/app"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Start Creating &rarr;
            </Link>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                variants={item}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-zinc-900/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    prompt.type === 'IMAGE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    prompt.type === 'VIDEO' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {prompt.type}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-white transition-colors">
                  {prompt.title || "Untitled Prompt"}
                </h3>

                <p className="text-zinc-400 text-sm line-clamp-3 mb-4 h-16">
                  {prompt.original_idea}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/50">
                  <button className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                    <Icons.Copy className="w-3 h-3" /> Copy
                  </button>
                  <div className="flex-1" />
                  <button className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
                    <Icons.Delete className="w-3 h-3" />
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

export default Dashboard;
