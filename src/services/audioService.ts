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
  AMBIENT = 'ambient'
}

// Audio file paths
const AUDIO_BASE_PATH = '/audio';
const AUDIO_PROMPTS_PATH = `${AUDIO_BASE_PATH}/prompts`;
const AUDIO_FEEDBACK_PATH = `${AUDIO_BASE_PATH}/feedback`;

// Feedback sound filenames
const AUDIO_FILES = {
  CORRECT: 'correct.mp3',
  INCORRECT: 'incorrect.mp3',
  LEVEL_COMPLETE: 'level_complete.mp3',
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
  private isMuted: boolean = false;
  
  // Currently playing sounds
  private currentSounds: HTMLAudioElement[] = [];

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
  private async playAudio(path: string, category: AudioCategory): Promise<void> {
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
}

// Export singleton instance
export const audioService = new AudioService();