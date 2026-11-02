export interface PluginConfig {
  // Model selection
  modelType: 'phi-2' | 'tinyllama';
  modelPath: string;
  
  // AI service connection
  aiServiceHost: string;
  aiServicePort: number;
  
  // Filter settings
  confidenceThreshold: number;
  actionOnProfanity: 'mute' | 'skip' | 'both';
  
  // Performance
  maxInferenceTime: number;
  fallbackThreshold: number;
}

export const defaultConfig: PluginConfig = {
  modelType: 'phi-2',
  modelPath: '/app/models/ggml-phi-2-f16.gguf',
  aiServiceHost: 'localhost',
  aiServicePort: 3000,
  confidenceThreshold: 0.5,
  actionOnProfanity: 'both',
  maxInferenceTime: 100,
  fallbackThreshold: 2.0,
};

export interface ModelInfo {
  name: string;
  sizeMb: number;
  description: string;
}

export const availableModels: ModelInfo[] = [
  {
    name: 'Phi-2',
    sizeMb: 2048,
    description: 'Microsoft Phi-2 (2.7B parameters) - High accuracy profanity detection',
  },
  {
    name: 'TinyLlama',
    sizeMb: 1300,
    description: 'TinyLlama 1.1B - Lightweight alternative for lower-end hardware',
  },
];
