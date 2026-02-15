import { supabase } from '../lib/supabase';
import type { DbPrompt } from '../lib/supabase';
import type { HistoryItem } from '../types';
import { TargetModelType } from '../types';

function dbRowToHistoryItem(row: DbPrompt): HistoryItem {
  return {
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    title: row.title,
    originalIdea: row.original_idea,
    optimizedPrompt: row.optimized_prompt,
    negativePrompt: row.negative_prompt ?? undefined,
    explanation: row.explanation ?? '',
    suggestedTags: row.suggested_tags ?? [],
    type: row.type as TargetModelType,
  };
}

export async function fetchPrompts(userId: string): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(dbRowToHistoryItem);
}

export async function savePrompt(
  userId: string,
  item: Omit<HistoryItem, 'id' | 'timestamp'>
): Promise<HistoryItem> {
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      title: item.title,
      original_idea: item.originalIdea,
      optimized_prompt: item.optimizedPrompt,
      negative_prompt: item.negativePrompt ?? null,
      explanation: item.explanation,
      suggested_tags: item.suggestedTags,
      type: item.type,
    })
    .select()
    .single();

  if (error) throw error;
  return dbRowToHistoryItem(data as DbPrompt);
}

export async function deletePrompt(userId: string, promptId: string): Promise<void> {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
    .eq('user_id', userId);

  if (error) throw error;
}
