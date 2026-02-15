import React, { useState } from 'react';
import { Icons } from './Icons';
import { PromptOptions, TargetModelType } from '../types';

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
    // { type: TargetModelType.AUDIO, icon: Icons.Audio, label: 'Audio / TTS' },
  ];

  const stylePresets: Record<TargetModelType, string[]> = {
    [TargetModelType.IMAGE]: ['Photorealistic', 'Anime', 'Digital Art', 'Oil Painting', 'Cyberpunk', 'Minimalist', 'Surrealism', '3D Render'],
    [TargetModelType.VIDEO]: ['Cinematic', 'Drone Shot', 'Handheld', 'Animation', 'Timelapse', 'Slow Motion', 'Music Video'],
    [TargetModelType.TEXT]: ['Professional', 'Creative', 'Academic', 'Witty', 'Persuasive', 'Technical', 'Storytelling'],
    [TargetModelType.AUDIO]: ['Natural', 'Dramatic', 'News Anchor', 'Whisper']
  };

  const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-colors';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6"
    >
      <div className="grid grid-cols-3 gap-2">
        {modelOptions.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => setTargetModel(opt.type)}
            style={targetModel === opt.type ? { backgroundColor: '#ffffff', color: '#000000' } : { backgroundColor: '#27272a' }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white ${targetModel === opt.type
              ? 'border-white text-zinc-900 shadow-md'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
          >
            <opt.icon className="w-5 h-5 mb-1.5" />
            <span className="text-xs font-medium">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Icons.Sparkles className="w-4 h-4 text-zinc-500" />
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
          className={`${inputClass} resize-none h-32`}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Style / Tone
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className={inputClass}
          >
            {stylePresets[targetModel]?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Custom">Custom...</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Detail Level
          </label>
          <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
            {(['concise', 'balanced', 'detailed'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setComplexity(l)}
                style={complexity === l ? { backgroundColor: '#ffffff', color: '#000000' } : {}}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors focus:outline-none focus:ring-1 focus:ring-white ${complexity === l
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {(targetModel === TargetModelType.IMAGE || targetModel === TargetModelType.VIDEO) && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className={inputClass}
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Classic)</option>
              <option value="21:9">21:9 (Cinematic)</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
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
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !baseIdea.trim()}
        className="w-full py-3.5 px-6 rounded-xl font-medium text-zinc-900 bg-zinc-100 hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Icons.Loading className="w-5 h-5 animate-spin" />
            Enhancing Prompt...
          </>
        ) : (
          <>
            <Icons.Magic className="w-5 h-5" />
            Generate Pro Prompt
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm;
