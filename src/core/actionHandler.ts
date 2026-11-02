export interface PlaybackControlRequest {
  sessionId?: string;
  playbackStartTime?: number;
  action: 'pause' | 'resume' | 'mute' | 'skip';
}

export interface MuteRequest extends PlaybackControlRequest {
  action: 'mute';
}

export interface SkipRequest extends PlaybackControlRequest {
  action: 'skip';
  durationMs?: number;
}

export interface FilterStatusResponse {
  enabled: boolean;
  isPaused: boolean;
  lastActionTime?: number;
  lastActionType?: string;
}

export class ActionHandler {
  private activeSession: PlaybackControlRequest | null = null;
  private isPaused: boolean = false;
  private playbackStartTime: number | null = null;

  constructor() {
    // Initialize
  }

  public async initialize(): Promise<void> {
    // Initialize action handler
  }

  public async pausePlayback(request: MuteRequest): Promise<void> {
    this.activeSession = request;
    this.isPaused = true;
    this.playbackStartTime = Date.now();
    
    // Send pause command to Jellyfin via API
    // await jellyfinApi.pauseSession(request.sessionId);
  }

  public async skipWord(request: SkipRequest): Promise<void> {
    const durationMs = request.durationMs || 1500; // Default 1.5s skip
    
    this.activeSession = request;
    
    // Send pause command to Jellyfin via API
    // await jellyfinApi.pauseSession(request.sessionId);
    
    // Wait for the skip duration
    // await new Promise(resolve => setTimeout(resolve, durationMs));
    
    // Send resume command
    // await jellyfinApi.resumeSession(request.sessionId);
  }

  public async resumePlayback(request: PlaybackControlRequest): Promise<void> {
    this.isPaused = false;
    this.playbackStartTime = null;
    this.activeSession = null;
    
    // Send resume command to Jellyfin via API
    // await jellyfinApi.resumeSession(request.sessionId);
  }

  public async getFilterStatus(request: PlaybackControlRequest): Promise<FilterStatusResponse> {
    return {
      enabled: true,
      isPaused: this.isPaused,
      lastActionTime: this.playbackStartTime ? Date.now() - this.playbackStartTime : undefined,
      lastActionType: this.activeSession?.action || undefined,
    };
  }

  public setActiveSession(session: PlaybackControlRequest): void {
    this.activeSession = session;
  }

  public clearActiveSession(): void {
    this.activeSession = null;
  }

  public async reset(): Promise<void> {
    this.isPaused = false;
    this.playbackStartTime = null;
    this.activeSession = null;
  }
}
