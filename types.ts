/** Supported content generation targets */
export enum TargetModelType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO'
}

/** Image AI model identifiers */
export type ImageAIModel = 'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Flux.1';

/** Video AI model identifiers */
export type VideoAIModel = 'Runway Gen-3' | 'Luma Dream Machine' | 'Kling' | 'OpenAI Sora' | 'Veo';

/** All generation parameters passed to the AI service */
export interface PromptOptions {
  /** The user's raw creative idea */
  baseIdea: string;
  /** Content type (IMAGE, VIDEO, TEXT, AUDIO) */
  targetModel: TargetModelType;
  /** Visual style preset (e.g. Photorealistic, Anime) */
  style: string;
  /** Level of detail in the output */
  complexity: 'concise' | 'balanced' | 'detailed';
  /** Aspect ratio for images (e.g. 16:9) */
  aspectRatio?: string;
  /** Emotional tone / atmosphere */
  mood?: string;
  /** Target AI model for generation */
  aiModel?: ImageAIModel | VideoAIModel;
  /** Generation mode: static image or video clip */
  mode?: 'image' | 'video';
  /** Camera movement type for video mode */
  camera?: string;
}

/** Structured result returned by the AI service */
export interface EnhancedResult {
  title: string;
  optimizedPrompt: string;
  negativePrompt?: string;
  explanation: string;
  suggestedTags: string[];
}

/** Supabase-backed history item (extends EnhancedResult) */
export interface HistoryItem extends EnhancedResult {
  id: string;
  timestamp: number;
  originalIdea: string;
  type: TargetModelType;
}

/** localStorage-based history item with positive/negative separation */
export interface LocalHistoryItem {
  id: string;
  /** Original user input */
  original: string;
  /** Enhanced positive prompt */
  positive: string;
  /** Negative prompt (things to avoid) */
  negative: string;
  timestamp: number;
}
