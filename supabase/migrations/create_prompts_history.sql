-- Supabase SQL: Run this in the Supabase SQL Editor
-- Dashboard → SQL Editor → New query

create table if not exists prompts_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  original_prompt text not null,
  enhanced_prompt text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table prompts_history enable row level security;

-- Users can only see and manage their own prompts
create policy "Users can read own prompt history"
  on prompts_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own prompt history"
  on prompts_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own prompt history"
  on prompts_history for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists idx_prompts_history_user_id
  on prompts_history (user_id, created_at desc);
