import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PromptHistoryItem {
    id: string;
    user_id: string;
    original_prompt: string;
    enhanced_prompt: string;
    created_at: string;
}

export async function saveEnhancedPrompt(
    userId: string,
    originalPrompt: string,
    enhancedPrompt: string
): Promise<PromptHistoryItem> {
    const { data, error } = await supabase
        .from('prompts_history')
        .insert({
            user_id: userId,
            original_prompt: originalPrompt,
            enhanced_prompt: enhancedPrompt,
        })
        .select()
        .single();

    if (error) throw error;
    return data as PromptHistoryItem;
}

export async function fetchRecentPrompts(
    userId: string,
    limit: number = 10
): Promise<PromptHistoryItem[]> {
    const { data, error } = await supabase
        .from('prompts_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as PromptHistoryItem[];
}

export async function deleteAllPrompts(userId: string): Promise<void> {
    const { error } = await supabase
        .from('prompts_history')
        .delete()
        .eq('user_id', userId);

    if (error) throw error;
}

/**
 * Subscribe to realtime INSERT events on prompts_history for a specific user.
 * Returns a cleanup function to unsubscribe.
 */
export function subscribeToPrompts(
    userId: string,
    onInsert: (item: PromptHistoryItem) => void,
    onDelete?: () => void
): () => void {
    const channel: RealtimeChannel = supabase
        .channel(`prompts_history:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'prompts_history',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                onInsert(payload.new as PromptHistoryItem);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'prompts_history',
                filter: `user_id=eq.${userId}`,
            },
            () => {
                onDelete?.();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
