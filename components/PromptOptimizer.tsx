import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { enhancePrompt } from '@/services/ai.service';
import {
    saveEnhancedPrompt,
    fetchRecentPrompts,
    deleteAllPrompts,
    subscribeToPrompts,
    type PromptHistoryItem,
} from '@/services/prompt.service';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/Icons';

const STYLE_PRESETS = [
    { label: 'Cyberpunk', value: 'cyberpunk style' },
    { label: 'Photorealistic', value: 'photorealistic' },
    { label: 'Studio Lighting', value: 'studio lighting' },
    { label: 'Oil Painting', value: 'oil painting style' },
    { label: 'Macro', value: 'macro photography' },
] as const;

export const PromptOptimizer: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<PromptHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const { user } = useAuth();

    // Load history on mount
    const loadHistory = useCallback(async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const items = await fetchRecentPrompts(user.id, 5);
            setHistory(items);
        } catch {
            // Silently fail — table might not exist yet
        } finally {
            setHistoryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToPrompts(
            user.id,
            // On INSERT — add new item to the top (avoid duplicates from own session)
            (newItem) => {
                setHistory((prev) => {
                    if (prev.some((p) => p.id === newItem.id)) return prev;
                    return [newItem, ...prev].slice(0, 5);
                });
            },
            // On DELETE — reload history
            () => {
                loadHistory();
            }
        );

        return unsubscribe;
    }, [user, loadHistory]);

    const handleEnhance = async () => {
        if (!input.trim()) {
            toast.error('Enter a prompt idea first');
            return;
        }
        setLoading(true);
        setOutput('');
        try {
            const { enhancedPrompt } = await enhancePrompt(input.trim());
            setOutput(enhancedPrompt);

            // Save to Supabase if logged in
            if (user) {
                try {
                    await saveEnhancedPrompt(user.id, input.trim(), enhancedPrompt);
                    // Realtime subscription will handle adding to history
                } catch {
                    // Save failed silently — don't break the flow
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to enhance prompt';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete all your prompt history?')) return;
        try {
            await deleteAllPrompts(user.id);
            setHistory([]);
            toast.success('History cleared');
        } catch {
            toast.error('Failed to clear history');
        }
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Prompt copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    const handlePresetClick = (value: string) => {
        setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed}, ${value}` : value;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault();
            handleEnhance();
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Optimizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Input Side */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="prompt-input" className="text-zinc-400 text-sm">
                                Your idea
                            </Label>
                            <Input
                                id="prompt-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder='e.g. "a cat sitting on the moon"'
                                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-400 min-h-[48px]"
                                disabled={loading}
                            />
                        </div>

                        {/* Style Presets */}
                        <div className="space-y-2">
                            <span className="text-xs text-zinc-500">Quick styles</span>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_PRESETS.map((preset) => (
                                    <Badge
                                        key={preset.value}
                                        variant="outline"
                                        className="cursor-pointer border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-600 transition-colors select-none"
                                        onClick={() => handlePresetClick(preset.value)}
                                    >
                                        {preset.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleEnhance}
                            disabled={loading || !input.trim()}
                            className="w-full min-h-[44px] gap-2"
                        >
                            {loading ? (
                                <>
                                    <Icons.Loading className="w-4 h-4 animate-spin" />
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Icons.Sparkles className="w-4 h-4" />
                                    Enhance Prompt
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-zinc-600 text-center">
                            Powered by Groq · llama3-70b
                        </p>
                    </CardContent>
                </Card>

                {/* Output Side */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 md:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400 text-sm">Enhanced prompt</Label>
                            {output && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(output)}
                                    className="gap-1.5 text-zinc-400 hover:text-zinc-100 h-8"
                                >
                                    {copied ? (
                                        <>
                                            <Icons.Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Copy className="w-3.5 h-3.5" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="relative min-h-[120px] rounded-lg bg-zinc-950 border border-zinc-800 p-4">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full min-h-[88px] gap-3"
                                    >
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-zinc-500"
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-zinc-600">AI is thinking...</span>
                                    </motion.div>
                                ) : output ? (
                                    <motion.p
                                        key="result"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap"
                                    >
                                        {output}
                                    </motion.p>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full min-h-[88px] text-center"
                                    >
                                        <Icons.Magic className="w-6 h-6 text-zinc-700 mb-2" />
                                        <p className="text-sm text-zinc-600">
                                            Your enhanced prompt will appear here
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Prompt History */}
            {user && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Icons.History className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-400">Recent prompts</span>
                                {/* Live indicator */}
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-xs text-zinc-600">Live</span>
                            </div>

                            {history.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearHistory}
                                    className="gap-1.5 text-zinc-500 hover:text-red-400 h-8"
                                >
                                    <Icons.Delete className="w-3.5 h-3.5" />
                                    Clear History
                                </Button>
                            )}
                        </div>

                        {historyLoading ? (
                            <div className="flex items-center gap-2 text-zinc-600 text-sm py-4">
                                <Icons.Loading className="w-4 h-4 animate-spin" />
                                Loading...
                            </div>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-zinc-600 py-4 text-center">
                                No prompts yet. Enhanced prompts will appear here.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((item, idx) => (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        type="button"
                                        onClick={() => handleCopy(item.enhanced_prompt)}
                                        className="w-full text-left p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all group"
                                    >
                                        <p className="text-xs text-zinc-500 mb-1 truncate">
                                            {item.original_prompt}
                                        </p>
                                        <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                                            {item.enhanced_prompt}
                                        </p>
                                        <span className="text-xs text-zinc-600 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icons.Copy className="w-3 h-3" />
                                            Click to copy
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
