import { ProfanityClassifier } from './profanityClassifier';
import { WhisperService } from './whisperService';
import { AudioProcessor } from './audioProcessor';
import { FilterEngine } from '../core/filterEngine';
import { ActionHandler } from '../core/actionHandler';
import { WordMatcher } from '../core/wordMatcher';

export interface AIConfig {
  modelPath: string;
  modelType: 'phi-2' | 'tinyllama';
  confidenceThreshold: number;
  audioChunkSize: number;
  serverHost?: string;
  serverPort?: number;
}

export class AIService {
  private classifier: ProfanityClassifier;
  private whisper: WhisperService;
  private audioProcessor: AudioProcessor;
  private filterEngine: FilterEngine;
  private actionHandler: ActionHandler;
  private wordMatcher: WordMatcher;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.classifier = new ProfanityClassifier(config);
    this.whisper = new WhisperService();
    this.audioProcessor = new AudioProcessor(config.audioChunkSize);
    this.filterEngine = new FilterEngine();
    this.actionHandler = new ActionHandler();
    this.wordMatcher = new WordMatcher();
  }

  async initialize(): Promise<void> {
    await this.classifier.initialize();
    await this.whisper.initialize();
    await this.filterEngine.initialize();
    await this.actionHandler.initialize();
    console.log('AI Service initialized successfully');
  }

  async processAudioChunk(audioData: Buffer): Promise<{ text: string; isProfane: boolean }> {
    const text = await this.audioProcessor.process(audioData);
    if (!text || text.trim().length === 0) return { text, isProfane: false };
    
    const result = await this.classifier.classify(text);
    return { text, isProfane: result.isProfane };
  }

  async handlePlaybackControl(action: 'pause' | 'resume'): Promise<void> {
    if (action === 'pause') {
      await this.actionHandler.pausePlayback({ action: 'mute' });
    } else {
      await this.actionHandler.resumePlayback({ action: 'resume' });
    }
  }

  async getFilterStatus(): Promise<{
    enabled: boolean;
    confidenceThreshold: number;
    wordsCount: number;
    isProcessing: boolean;
  }> {
    return {
      enabled: this.config.confidenceThreshold > 0,
      confidenceThreshold: this.config.confidenceThreshold,
      wordsCount: this.wordMatcher.getWordCount(),
      isProcessing: false,
    };
  }

  async loadCustomWords(filePath: string): Promise<void> {
    await this.wordMatcher.loadFromFile(filePath);
  }

  async getWordList(): Promise<string[]> {
    return this.wordMatcher.getWords();
  }

  async addWord(word: string, category: string = 'custom'): Promise<void> {
    await this.wordMatcher.addWord(word, category);
  }

  async removeWord(word: string): Promise<void> {
    await this.wordMatcher.removeWord(word);
  }
}

export default AIService;
