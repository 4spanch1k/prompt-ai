export enum TargetModelType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO'
}

export interface PromptOptions {
  baseIdea: string;
  targetModel: TargetModelType;
  style: string;
  complexity: 'concise' | 'balanced' | 'detailed';
  aspectRatio?: string; // For images/video
  mood?: string;
}

export interface EnhancedResult {
  title: string;
  optimizedPrompt: string;
  negativePrompt?: string;
  explanation: string;
  suggestedTags: string[];
}

export interface HistoryItem extends EnhancedResult {
  id: string;
  timestamp: number;
  originalIdea: string;
  type: TargetModelType;
}
