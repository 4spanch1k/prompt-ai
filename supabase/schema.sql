-- Run this in Supabase Dashboard → SQL Editor

-- Table: prompts (saved enhanced prompts per user)
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_idea TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  explanation TEXT,
  suggested_tags TEXT[] DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('IMAGE', 'VIDEO', 'TEXT', 'AUDIO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- Row Level Security (RLS): users can only read/write their own prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);
