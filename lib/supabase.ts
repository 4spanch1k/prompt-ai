import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('PromptCraft: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local');
}

// Supabase throws if URL is empty; use placeholders so the app loads and only API calls fail until env is set
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export type DbPrompt = {
  id: string;
  user_id: string;
  title: string;
  original_idea: string;
  optimized_prompt: string;
  negative_prompt: string | null;
  explanation: string | null;
  suggested_tags: string[];
  type: string;
  created_at: string;
};
