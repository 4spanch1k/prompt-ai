import React, { useState } from 'react';
import { Icons } from './Icons';
import { PromptOptions, TargetModelType } from '../types';
import styles from './PromptForm.module.css';

interface PromptFormProps {
  onSubmit: (options: PromptOptions) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [baseIdea, setBaseIdea] = useState('');
  const [targetModel, setTargetModel] = useState<TargetModelType>(TargetModelType.IMAGE);
  const [style, setStyle] = useState('Photorealistic');
  const [mood, setMood] = useState('');
  const [complexity, setComplexity] = useState<'concise' | 'balanced' | 'detailed'>('detailed');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseIdea.trim()) return;
    onSubmit({
      baseIdea,
      targetModel,
      style,
      mood,
      complexity,
      aspectRatio: targetModel === TargetModelType.IMAGE || targetModel === TargetModelType.VIDEO ? aspectRatio : undefined
    });
  };

  const modelOptions = [
    { type: TargetModelType.IMAGE, icon: Icons.Image, label: 'Image Generation' },
    { type: TargetModelType.VIDEO, icon: Icons.Video, label: 'Video Generation' },
    { type: TargetModelType.TEXT, icon: Icons.Text, label: 'Text / LLM' },
  ];

  const stylePresets: Record<TargetModelType, string[]> = {
    [TargetModelType.IMAGE]: ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', 'Cyberpunk', 'Minimalist', 'Surrealism', '3D Render'],
    [TargetModelType.VIDEO]: ['Cinematic', 'Drone Shot', 'Handheld', 'Animation', 'Timelapse', 'Slow Motion', 'Music Video'],
    [TargetModelType.TEXT]: ['Professional', 'Creative', 'Academic', 'Witty', 'Persuasive', 'Technical', 'Storytelling'],
    [TargetModelType.AUDIO]: ['Natural', 'Dramatic', 'News Anchor', 'Whisper']
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.modelGrid}>
        {modelOptions.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => setTargetModel(opt.type)}
            className={`${styles.modelBtn} ${targetModel === opt.type ? styles.modelBtnActive : ''}`}
          >
            <opt.icon className={styles.modelIcon} />
            <span className={styles.modelLabel}>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          <Icons.Sparkles className={styles.fieldLabelIcon} />
          What do you want to create?
        </label>
        <textarea
          value={baseIdea}
          onChange={(e) => setBaseIdea(e.target.value)}
          placeholder={
            targetModel === TargetModelType.IMAGE
              ? 'e.g., A futuristic city with flying cars...'
              : targetModel === TargetModelType.TEXT
                ? 'e.g., An email asking for a raise...'
                : 'Describe your idea...'
          }
          className={styles.textarea}
          required
        />
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.settingLabel}>
            Style / Tone
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className={styles.select}
          >
            {stylePresets[targetModel]?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Custom">Custom...</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.settingLabel}>
            Detail Level
          </label>
          <div className={styles.toggleGroup}>
            {(['concise', 'balanced', 'detailed'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setComplexity(l)}
                className={`${styles.toggleBtn} ${complexity === l ? styles.toggleBtnActive : ''}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {(targetModel === TargetModelType.IMAGE || targetModel === TargetModelType.VIDEO) && (
          <div className={styles.fieldGroup}>
            <label className={styles.settingLabel}>
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className={styles.select}
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Classic)</option>
              <option value="21:9">21:9 (Cinematic)</option>
            </select>
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.settingLabel}>
            {targetModel === TargetModelType.TEXT ? 'Audience / Context' : 'Mood / Lighting'}
          </label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder={
              targetModel === TargetModelType.TEXT
                ? 'e.g., HR Manager'
                : 'e.g., Golden Hour, Melancholy'
            }
            className={styles.textInput}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !baseIdea.trim()}
        className={styles.submitBtn}
      >
        {isLoading ? (
          <>
            <Icons.Loading className={`${styles.submitIcon} ${styles.spinIcon}`} />
            Enhancing Prompt...
          </>
        ) : (
          <>
            <Icons.Magic className={styles.submitIcon} />
            Generate Pro Prompt
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm;
