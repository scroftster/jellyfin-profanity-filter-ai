export interface WordPattern {
  pattern: string;
  category: 'custom' | 'slang' | 'explicit' | 'offensive';
  enabled: boolean;
}

export class WordMatcher {
  private patterns: WordPattern[] = [];
  private customWordsFile?: string;

  public async initialize(): Promise<void> {
    // Load default profanity patterns
    this.patterns = [
      { pattern: 'fuck|f#ck|f*ck|f_ck', category: 'explicit', enabled: true },
      { pattern: 'shit|sh*t|s#it|shi+t', category: 'explicit', enabled: true },
      { pattern: 'bitch|bi*tch|b*tch', category: 'offensive', enabled: true },
      { pattern: 'asshole|a$$hole|a#shole', category: 'offensive', enabled: true },
      { pattern: 'damn|d@mn|d##n', category: 'slang', enabled: true },
      { pattern: 'hell|helll|h3ll', category: 'slang', enabled: true },
      { pattern: 'crap|cr*p|c*r@p', category: 'slang', enabled: true },
      { pattern: 'goddamnit|fucking|bullshit', category: 'explicit', enabled: true },
    ];
  }

  public async loadFromFile(filePath: string): Promise<void> {
    this.customWordsFile = filePath;
    // Implementation to load custom words from file
  }

  public match(text: string): string[] {
    const detected: string[] = [];
    
    for (const pattern of this.patterns) {
      if (!pattern.enabled) continue;
      
      const regex = new RegExp(pattern.pattern, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const word = match[0].toLowerCase();
        if (!detected.includes(word)) {
          detected.push(word);
        }
      }
    }

    // Check custom words file if loaded
    if (this.customWordsFile) {
      const customWords = this.readCustomWords(this.customWordsFile);
      for (const word of customWords) {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (regex.test(text)) {
          if (!detected.includes(word.toLowerCase())) {
            detected.push(word.toLowerCase());
          }
        }
      }
    }

    return detected;
  }

  private readCustomWords(filePath: string): string[] {
    // Placeholder - would read file in actual implementation
    return [];
  }

  public getWordCount(): number {
    return this.patterns.filter(p => p.enabled).length;
  }

  public addWord(word: string, category: string = 'custom'): Promise<void> {
    // Implementation to add custom word
    return Promise.resolve();
  }

  public removeWord(word: string): Promise<void> {
    // Implementation to remove word
    return Promise.resolve();
  }

  public getWords(): string[] {
    const words: string[] = [];
    for (const pattern of this.patterns) {
      if (pattern.enabled) {
        const regex = new RegExp(pattern.pattern, 'gi');
        let match;
        while ((match = regex.exec('')) !== null) {} // Just to get patterns
        words.push(pattern.pattern);
      }
    }
    return words;
  }
}
