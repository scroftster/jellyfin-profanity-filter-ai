import * as fs from 'fs';
import * as path from 'path';

export interface ModelInfo {
  name: string;
  sizeMb: number;
  description: string;
  url: string;
}

export class ModelUpdater {
  private modelsDir: string;
  private modelConfig: {
    phi2Path: string;
    tinyllamaPath: string;
    phi2Url: string;
    tinyllamaUrl: string;
  };

  constructor(modelsDir: string = '/app/models') {
    this.modelsDir = modelsDir;
    this.modelConfig = {
      phi2Path: path.join(modelsDir, 'ggml-phi-2-f16.gguf'),
      tinyllamaPath: path.join(modelsDir, 'ggml-model-q4_k_m.gguf'),
      phi2Url: 'https://huggingface.co/microsoft/Phi-2/resolve/main/ggml-phi-2-f16.gguf',
      tinyllamaUrl: 'https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/ggml-model-q4_k_m.gguf',
    };
  }

  public async ensureModelsExist(): Promise<void> {
    console.log('Checking for model files...');

    // Check if Phi-2 exists
    if (!fs.existsSync(this.modelConfig.phi2Path)) {
      console.log(`Phi-2 model not found. Downloading from: ${this.modelConfig.phi2Url}`);
      await this.downloadModel(this.modelConfig.phi2Path, this.modelConfig.phi2Url);
      console.log('Phi-2 model downloaded successfully');
    } else {
      const size = this.formatFileSize(fs.statSync(this.modelConfig.phi2Path).size);
      console.log(`Phi-2 model exists: ${this.modelConfig.phi2Path} (${size})`);
    }

    // Check if TinyLlama exists
    if (!fs.existsSync(this.modelConfig.tinyllamaPath)) {
      console.log(`TinyLlama model not found. Downloading from: ${this.modelConfig.tinyllamaUrl}`);
      await this.downloadModel(this.modelConfig.tinyllamaPath, this.modelConfig.tinyllamaUrl);
      console.log('TinyLlama model downloaded successfully');
    } else {
      const size = this.formatFileSize(fs.statSync(this.modelConfig.tinyllamaPath).size);
      console.log(`TinyLlama model exists: ${this.modelConfig.tinyllamaPath} (${size})`);
    }

    console.log('All models are ready');
  }

  private async downloadModel(filePath: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = require('request');
      
      request({
        url: url,
        out: filePath,
        fs: { createReadStream: () => {} },
        gzip: true,
      }, (error: any, response: any, body: any) => {
        if (error) {
          reject(error);
          return;
        }

        // Verify download completed
        const stats = fs.statSync(filePath);
        console.log(`Model downloaded: ${filePath} (${this.formatFileSize(stats.size)})`);
        resolve();
      });
    });
  }

  public async checkForUpdates(): Promise<{ phi2: boolean; tinyllama: boolean }> {
    const updates: { phi2: boolean; tinyllama: boolean } = {
      phi2: false,
      tinyllama: false,
    };

    // Check Phi-2 for newer versions
    const phi2Versions = await this.getAvailableVersions('microsoft/Phi-2');
    const currentPhi2Version = this.getCurrentModelVersion(this.modelConfig.phi2Path);
    
    if (phi2Versions.length > 0) {
      const latestPhi2 = phi2Versions[0];
      if (latestPhi2.version !== currentPhi2Version) {
        console.log(`Phi-2 update available: ${currentPhi2Version} -> ${latestPhi2.version}`);
        updates.phi2 = true;
      }
    }

    // Check TinyLlama for newer versions
    const tinyllamaVersions = await this.getAvailableVersions('TinyLlama/TinyLlama-1.1B-Chat-v1.0');
    const currentTinyllamaVersion = this.getCurrentModelVersion(this.modelConfig.tinyllamaPath);

    if (tinyllamaVersions.length > 0) {
      const latestTinyllama = tinyllamaVersions[0];
      if (latestTinyllama.version !== currentTinyllamaVersion) {
        console.log(`TinyLlama update available: ${currentTinyllamaVersion} -> ${latestTinyllama.version}`);
        updates.tinyllama = true;
      }
    }

    return updates;
  }

  private async getAvailableVersions(repo: string): Promise<Array<{ version: string; sizeMb: number }>> {
    // Placeholder - would implement HuggingFace API call in production
    return [];
  }

  private getCurrentModelVersion(filePath: string): string | null {
    if (!fs.existsSync(filePath)) return null;
    
    // Extract version from filename or check metadata
    const fileName = path.basename(filePath);
    const match = fileName.match(/v?(\d+\.\d+)/);
    return match ? match[1] : null;
  }

  private formatFileSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
}
