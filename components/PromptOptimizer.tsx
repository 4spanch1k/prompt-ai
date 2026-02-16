import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateEnhancedPrompt, describeImage } from '@/services/ai.service';
import { TargetModelType } from '@/types';
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

import styles from './PromptOptimizer.module.css';

const STYLE_OPTIONS = ['Photorealistic', 'Anime', 'Cyberpunk', 'Oil Painting', 'Digital Art', 'Minimalist', '3D Render', 'Cinematic'] as const;
const RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '21:9'] as const;
const MOOD_PRESETS = ['Neutral', 'Dark', 'Cheerful', 'Melancholy', 'Epic', 'Dreamy', 'Golden Hour'] as const;

export const PromptOptimizer: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<PromptHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [style, setStyle] = useState<string>('Photorealistic');
    const [ratio, setRatio] = useState<string>('16:9');
    const [mood, setMood] = useState<string>('Neutral');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error('Image must be under 20MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setImageBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const { user } = useAuth();

    const loadHistory = useCallback(async () => {
        if (!user) return;
        setHistoryLoading(true);
        try {
            const items = await fetchRecentPrompts(user.id, 5);
            setHistory(items);
        } catch {
            // Silently fail
        } finally {
            setHistoryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToPrompts(
            user.id,
            (newItem) => {
                setHistory((prev) => {
                    if (prev.some((p) => p.id === newItem.id)) return prev;
                    return [newItem, ...prev].slice(0, 5);
                });
            },
            () => {
                loadHistory();
            }
        );

        return unsubscribe;
    }, [user, loadHistory]);

    const handleEnhance = async () => {
        if (!input.trim() && !imageBase64) {
            toast.error('Enter a prompt idea or upload an image');
            return;
        }
        setLoading(true);
        setOutput('');
        try {
            let enhancedPrompt: string;

            if (imageBase64) {
                // Image-to-Prompt mode
                enhancedPrompt = await describeImage(imageBase64, input.trim() || undefined);
            } else {
                // Text-to-Prompt mode
                const result = await generateEnhancedPrompt({
                    baseIdea: input.trim(),
                    targetModel: TargetModelType.IMAGE,
                    style,
                    complexity: 'detailed',
                    aspectRatio: ratio,
                    mood,
                });
                enhancedPrompt = result.optimizedPrompt;
            }

            setOutput(enhancedPrompt);

            if (user) {
                try {
                    const label = imageBase64 ? '[Image Upload]' : input.trim();
                    await saveEnhancedPrompt(user.id, label, enhancedPrompt);
                } catch {
                    // Save failed silently
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
        setStyle(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault();
            handleEnhance();
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* Main Optimizer */}
            <div className={styles.grid}>
                {/* Input Side */}
                <Card>
                    <CardContent className={styles.inputSection}>
                        <div className={styles.inputSection}>
                            <Label htmlFor="prompt-input" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                {imageBase64 ? 'Additional context (optional)' : 'Your idea'}
                            </Label>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="Upload preview" className={styles.imagePreviewImg} />
                                    <button type="button" onClick={clearImage} className={styles.imageRemoveBtn}>
                                        ✕
                                    </button>
                                    <span className={styles.imagePreviewLabel}>Image-to-Prompt mode</span>
                                </div>
                            )}

                            <div className={styles.inputRow}>
                                <Input
                                    id="prompt-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={imageBase64 ? 'Add optional context...' : 'e.g. "a cat sitting on the moon"'}
                                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', minHeight: '48px', flex: 1 }}
                                    disabled={loading}
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={styles.uploadBtn}
                                    title="Upload reference image"
                                    disabled={loading}
                                >
                                    <Icons.Image style={{ width: '1.125rem', height: '1.125rem' }} />
                                </Button>
                            </div>
                        </div>

                        {/* Style Presets */}
                        <div className={styles.presetsWrap}>
                            <span className={styles.presetsLabel}>Style</span>
                            <div className={styles.presetsList}>
                                {STYLE_OPTIONS.map((s) => (
                                    <Badge
                                        key={s}
                                        variant="outline"
                                        className={`${styles.presetBadge} ${style === s ? styles.presetBadgeActive : ''}`}
                                        onClick={() => handlePresetClick(s)}
                                    >
                                        {s}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className={styles.presetsWrap}>
                            <span className={styles.presetsLabel}>Aspect Ratio</span>
                            <div className={styles.presetsList}>
                                {RATIO_OPTIONS.map((r) => (
                                    <Badge
                                        key={r}
                                        variant="outline"
                                        className={`${styles.presetBadge} ${ratio === r ? styles.presetBadgeActive : ''}`}
                                        onClick={() => setRatio(r)}
                                    >
                                        {r}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Mood */}
                        <div className={styles.presetsWrap}>
                            <span className={styles.presetsLabel}>Mood</span>
                            <div className={styles.presetsList}>
                                {MOOD_PRESETS.map((m) => (
                                    <Badge
                                        key={m}
                                        variant="outline"
                                        className={`${styles.presetBadge} ${mood === m ? styles.presetBadgeActive : ''}`}
                                        onClick={() => setMood(m)}
                                    >
                                        {m}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleEnhance}
                            disabled={loading || (!input.trim() && !imageBase64)}
                            className={styles.fullButton}
                        >
                            {loading ? (
                                <>
                                    <Icons.Loading style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Icons.Sparkles style={{ width: '1rem', height: '1rem' }} />
                                    Enhance Prompt
                                </>
                            )}
                        </Button>

                        <p className={styles.poweredBy}>
                            Powered by Groq · llama-3.3-70b
                        </p>
                    </CardContent>
                </Card>

                {/* Output Side */}
                <Card>
                    <CardContent className={styles.inputSection}>
                        <div className={styles.outputHeader}>
                            <Label style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Enhanced prompt</Label>
                            {output && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(output)}
                                    className={styles.copyBtn}
                                >
                                    {copied ? (
                                        <>
                                            <Icons.Check style={{ width: '0.875rem', height: '0.875rem', color: 'var(--emerald)' }} />
                                            <span className={styles.copiedText}>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Copy style={{ width: '0.875rem', height: '0.875rem' }} />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className={styles.outputBox}>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={styles.loadingDots}
                                    >
                                        <div className={styles.dotsRow}>
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className={styles.dot}
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                        <span className={styles.thinkingText}>AI is thinking...</span>
                                    </motion.div>
                                ) : output ? (
                                    <motion.p
                                        key="result"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={styles.resultText}
                                    >
                                        {output}
                                    </motion.p>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={styles.emptyState}
                                    >
                                        <Icons.Magic className={styles.emptyIcon} />
                                        <p className={styles.emptyText}>
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
                <Card>
                    <CardContent>
                        <div className={styles.historyHeader}>
                            <div className={styles.historyTitle}>
                                <Icons.History className={styles.historyIcon} />
                                <span className={styles.historyLabel}>Recent prompts</span>
                                <span className={styles.liveIndicator}>
                                    <span className={styles.livePing} />
                                    <span className={styles.liveDot} />
                                </span>
                                <span className={styles.liveText}>Live</span>
                            </div>

                            {history.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearHistory}
                                    className={styles.clearBtn}
                                >
                                    <Icons.Delete className={styles.clearBtnIcon} />
                                    Clear History
                                </Button>
                            )}
                        </div>

                        {historyLoading ? (
                            <div className={styles.historyLoading}>
                                <Icons.Loading style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                                Loading...
                            </div>
                        ) : history.length === 0 ? (
                            <p className={styles.historyEmpty}>
                                No prompts yet. Enhanced prompts will appear here.
                            </p>
                        ) : (
                            <div className={styles.historyList}>
                                {history.map((item, idx) => (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        type="button"
                                        onClick={() => handleCopy(item.enhanced_prompt)}
                                        className={styles.historyItem}
                                    >
                                        <p className={styles.historyItemOriginal}>
                                            {item.original_prompt}
                                        </p>
                                        <p className={styles.historyItemEnhanced}>
                                            {item.enhanced_prompt}
                                        </p>
                                        <span className={styles.historyItemHint}>
                                            <Icons.Copy className={styles.historyItemHintIcon} />
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
