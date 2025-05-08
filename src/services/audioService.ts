/**
 * Audio Service for managing game sounds and speech
 */

// Volume control defaults
const DEFAULT_EFFECT_VOLUME = 0.7;
const DEFAULT_VOICE_VOLUME = 1.0;

// Audio categories
export enum AudioCategory {
  VOICE = 'voice',
  EFFECT = 'effect',
  AMBIENT = 'ambient',
  MUSIC = 'music'
}

// Audio file paths
const AUDIO_BASE_PATH = '/audio';
const AUDIO_PROMPTS_PATH = `${AUDIO_BASE_PATH}/prompts`;
const AUDIO_FEEDBACK_PATH = `${AUDIO_BASE_PATH}/feedback`;
const BACKGROUND_MUSIC = `${AUDIO_BASE_PATH}/bg.mp3`;

// Default music volume
const DEFAULT_MUSIC_VOLUME = 0.4;

// Feedback sound filenames
const AUDIO_FILES = {
  CORRECT: 'correct.mp3',
  INCORRECT: 'incorrect.mp3',
  LEVEL_COMPLETE: 'level_complete.mp3',
  BACKGROUND: 'bg.mp3',
}

/**
 * Service for handling audio playback
 */
export class AudioService {
  // Audio elements cache
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  
  // Volume settings
  private effectVolume: number = DEFAULT_EFFECT_VOLUME;
  private voiceVolume: number = DEFAULT_VOICE_VOLUME;
  private musicVolume: number = DEFAULT_MUSIC_VOLUME;
  private isMuted: boolean = false;
  
  // Currently playing sounds
  private currentSounds: HTMLAudioElement[] = [];
  
  // Background music reference
  private backgroundMusic: HTMLAudioElement | null = null;
  
  // Track if app is in background/screen is locked
  private isAppInBackground: boolean = false;
  
  constructor() {
    // Set up iOS wake lock handling if in browser environment
    if (typeof document !== 'undefined') {
      // Add event listeners for iOS handling
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }
  
  /**
   * Handle visibility change events
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.isAppInBackground = true;
      this.pauseBackgroundMusic();
    } else if (document.visibilityState === 'visible') {
      this.isAppInBackground = false;
      // Don't auto resume - we'll let user interaction handle that
    }
  }

  /**
   * Play a word audio prompt
   * 
   * @param filename - The audio file name from the word pair data
   * @returns Promise that resolves when audio playback starts
   */
  async playWordPrompt(filename: string): Promise<void> {
    const path = `${AUDIO_PROMPTS_PATH}/${filename}`;
    return this.playAudio(path, AudioCategory.VOICE);
  }
  
  /**
   * Play feedback sound for correct answer
   */
  async playCorrectSound(): Promise<void> {
    const path = `${AUDIO_FEEDBACK_PATH}/${AUDIO_FILES.CORRECT}`;
    return this.playAudio(path, AudioCategory.EFFECT);
  }
  
  /**
   * Play feedback sound for incorrect answer
   */
  async playIncorrectSound(): Promise<void> {
    const path = `${AUDIO_FEEDBACK_PATH}/${AUDIO_FILES.INCORRECT}`;
    return this.playAudio(path, AudioCategory.EFFECT);
  }
  
  /**
   * Play level complete sound
   */
  async playLevelCompleteSound(): Promise<void> {
    const path = `${AUDIO_FEEDBACK_PATH}/${AUDIO_FILES.LEVEL_COMPLETE}`;
    return this.playAudio(path, AudioCategory.EFFECT);
  }
  
  /**
   * Play audio file
   * 
   * @param path - Path to the audio file
   * @param category - Category of audio (for volume control)
   * @returns Promise that resolves when audio playback starts
   */
  async playAudio(path: string, category: AudioCategory = AudioCategory.EFFECT): Promise<void> {
    // If muted, do nothing
    if (this.isMuted) {
      return Promise.resolve();
    }
    
    // Get or create audio element
    const audio = this.getAudio(path);
    
    // Set volume based on category
    switch (category) {
      case AudioCategory.VOICE:
        audio.volume = this.voiceVolume;
        break;
      case AudioCategory.EFFECT:
        audio.volume = this.effectVolume;
        break;
      default:
        audio.volume = 0.5; // Default volume
    }
    
    // Keep track of playing sounds
    this.currentSounds.push(audio);
    
    // Play audio and handle completion
    const promise = audio.play();
    
    // Remove from playing sounds when done
    audio.onended = () => {
      this.currentSounds = this.currentSounds.filter(sound => sound !== audio);
    };
    
    return promise;
  }
  
  /**
   * Get audio element from cache or create new one
   */
  private getAudio(path: string): HTMLAudioElement {
    let audio = this.audioCache.get(path);
    
    if (!audio) {
      audio = new Audio(path);
      this.audioCache.set(path, audio);
    } else {
      // Reset if the audio already exists
      audio.currentTime = 0;
    }
    
    return audio;
  }
  
  /**
   * Set effect sound volume
   */
  setEffectVolume(volume: number): void {
    this.effectVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Set voice prompts volume
   */
  setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    // Stop all currently playing sounds if muted
    if (this.isMuted) {
      this.stopAll();
    }
    
    return this.isMuted;
  }
  
  /**
   * Check if audio is muted
   */
  isMutedState(): boolean {
    return this.isMuted;
  }
  
  /**
   * Stop all playing sounds
   */
  stopAll(): void {
    this.currentSounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    this.currentSounds = [];
  }

  /**
   * Preload audio files for better performance
   * 
   * @param paths - List of audio file paths to preload
   */
  preloadAudio(paths: string[]): void {
    paths.forEach(path => {
      const audio = new Audio(path);
      this.audioCache.set(path, audio);
      
      // Load but don't play
      audio.load();
    });
  }
  
  /**
   * Initialize background music (create instance without playing)
   * This prepares the music for playback without triggering autoplay restrictions
   */
  initBackgroundMusic(): HTMLAudioElement {
    // Create new background music instance if it doesn't exist
    if (!this.backgroundMusic) {
      const music = new Audio(BACKGROUND_MUSIC);
      
      // Configure music playback
      music.loop = true;
      music.volume = this.musicVolume;
      
      // Store reference to control it later
      this.backgroundMusic = music;
      
      // Preload the audio
      music.load();
      
      // Set up visibility change listener to handle screen locking/app backgrounding
      this.setupVisibilityListeners();
    }
    
    return this.backgroundMusic;
  }
  
  /**
   * Setup event listeners to pause music when app goes to background or screen is locked
   * This is particularly important for iOS devices
   */
  private setupVisibilityListeners(): void {
    // Handle page visibility changes (works for tab switching and some device locks)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden (minimized, tab switched, or screen locked)
        this.pauseBackgroundMusic();
      } else if (document.visibilityState === 'visible' && !this.isMuted) {
        // Only auto-resume if not muted - this will still respect autoplay restrictions
        // so music may not resume on iOS until next user interaction
        this.playBackgroundMusic();
      }
    });
    
    // iOS specific events
    if (typeof window !== 'undefined') {
      // Handle iOS going to background
      window.addEventListener('pagehide', () => {
        this.pauseBackgroundMusic();
      });
      
      // iOS low power mode or audio interruption
      window.addEventListener('freeze', () => {
        this.pauseBackgroundMusic();
      });
      
      // iOS specific event for audio session interruption
      // This catches phone calls and other audio interruptions
      if (this.backgroundMusic) {
        this.backgroundMusic.addEventListener('pause', () => {
          // When audio is externally paused, update our internal state
          // This prevents auto-resume when the interruption ends
          // The user will need to tap something to restart music
          if (this.backgroundMusic && this.backgroundMusic.paused) {
            // We don't actually need to call pause again,
            // just update our knowledge of music state
            console.log('Audio was externally paused (interruption/system)');
          }
        });
      }
    }
  }

  /**
   * Play background music in loop
   * Will start the background music if it's not already playing
   */
  playBackgroundMusic(): void {
    // Don't play music if muted or if the app is in the background
    if (this.isMuted || this.isAppInBackground) return;
    
    // If we already have background music, just resume it
    if (this.backgroundMusic) {
      // This promise will resolve if browser allows autoplay, or reject if not
      this.backgroundMusic.play().catch(error => {
        console.warn("Browser prevented autoplay - music will play on next user interaction", error);
      });
      return;
    }
    
    // Create new background music instance
    const music = new Audio(BACKGROUND_MUSIC);
    
    // Configure music playback
    music.loop = true;
    music.volume = this.musicVolume;
    
    // Set up event listeners for user interaction to enable autoplay
    const userInteractionEvents = ['click', 'touchstart', 'keydown'];
    
    const playOnUserInteraction = () => {
      music.play().then(() => {
        // Cleanup event listeners once we successfully play
        userInteractionEvents.forEach(event => {
          document.removeEventListener(event, playOnUserInteraction);
        });
        console.log('Background music started after user interaction');
      }).catch(error => {
        console.error("Failed to play music even after user interaction:", error);
      });
    };
    
    // Add event listeners to play on first user interaction
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, playOnUserInteraction, { once: true });
    });
    
    // Store reference to control it later
    this.backgroundMusic = music;
    
    // Try to play immediately (likely will be blocked by browser)
    music.play().catch(() => {
      // Silent catch - we expect this to fail on first page load
      // We'll rely on the user interaction events to start playback
    });
  }
  
  /**
   * Pause background music
   */
  pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }
  
  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }
  
  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Update current background music volume if it exists
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }
  
  /**
   * Check if background music is currently playing
   */
  isBackgroundMusicPlaying(): boolean {
    return !!this.backgroundMusic && 
           !this.backgroundMusic.paused && 
           !this.isMuted;
  }
  
  /**
   * Ensure music can play after user interaction
   * Call this from click handlers to enable music in browsers with autoplay restrictions
   */
  enableMusicPlayback(): void {
    // Don't do anything if music is already playing
    if (this.isBackgroundMusicPlaying()) return;
    
    // Don't play if muted or if app is in background (e.g., screen locked)
    if (this.isMuted || this.isAppInBackground) return;
    
    // Initialize music if it doesn't exist
    if (!this.backgroundMusic) {
      this.initBackgroundMusic();
    }
    
    // Try to play - this should work after user interaction
    if (this.backgroundMusic) {
      this.backgroundMusic.play().catch(error => {
        console.warn("Still couldn't play music after user interaction:", error);
      });
    }
  }
  
  /**
   * Toggle mute state - also affects background music
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    // Stop all currently playing sounds if muted
    if (this.isMuted) {
      this.stopAll();
      
      // Also pause background music
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
      }
    } else {
      // Resume background music if it exists
      if (this.backgroundMusic) {
        this.backgroundMusic.play().catch(console.error);
      }
    }
    
    return this.isMuted;
  }
}

// Export singleton instance
export const audioService = new AudioService();