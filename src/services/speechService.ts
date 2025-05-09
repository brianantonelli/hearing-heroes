/**
 * Speech Service for managing game speech feedback
 * Loads and provides random feedback messages for correct and incorrect answers
 */
import { loadYamlFile } from '../utils/yamlLoader';
import { audioService } from './audioService';

// Path to speech feedback file
const SPEECH_FEEDBACK_PATH = '/data/speech.yml';
const AUDIO_FEEDBACK_BASE = '/audio/feedback/';

// Speech feedback types
export type FeedbackType = 'pass' | 'fail';

// Individual feedback item
export interface FeedbackItem {
  text: string;
  audio: string;
}

// Speech feedback data structure
export interface SpeechFeedback {
  pass: FeedbackItem[];
  fail: FeedbackItem[];
}

/**
 * Service for managing speech feedback
 */
class SpeechService {
  private feedbackData: SpeechFeedback | null = null;
  private isLoading = false;

  /**
   * Initialize the service and load the feedback data
   */
  async initialize(): Promise<void> {
    if (this.feedbackData || this.isLoading) return;

    try {
      this.isLoading = true;
      this.feedbackData = await loadYamlFile<SpeechFeedback>(SPEECH_FEEDBACK_PATH);

      // Verify data structure
      if (!this.feedbackData || !this.feedbackData.pass || !this.feedbackData.fail) {
        throw new Error('Invalid speech feedback data structure');
      }

      this.isLoading = false;

      // Preload all audio files
      this.preloadAudioFiles();
    } catch (error) {
      console.error('Failed to load speech feedback data:', error);
      this.isLoading = false;

      // Create fallback data
      this.feedbackData = {
        pass: [{ text: 'Great job!', audio: 'correct.mp3' }],
        fail: [{ text: 'Try again!', audio: 'incorrect.mp3' }],
      };
    }
  }

  /**
   * Preload all audio files for better performance
   */
  private preloadAudioFiles(): void {
    if (!this.feedbackData) return;

    const audioFiles: string[] = [];

    // Add all pass feedback audio files
    this.feedbackData.pass.forEach(item => {
      audioFiles.push(`${AUDIO_FEEDBACK_BASE}${item.audio}`);
    });

    // Add all fail feedback audio files
    this.feedbackData.fail.forEach(item => {
      audioFiles.push(`${AUDIO_FEEDBACK_BASE}${item.audio}`);
    });

    // Preload all audio files
    audioService.preloadAudio(audioFiles);
  }

  /**
   * Get a random feedback item for the given type
   *
   * @param type - The type of feedback (pass or fail)
   * @returns A random feedback item
   */
  async getRandomFeedback(type: FeedbackType): Promise<FeedbackItem> {
    // Make sure data is loaded
    if (!this.feedbackData) {
      await this.initialize();
    }

    if (!this.feedbackData) {
      throw new Error('Failed to load speech feedback data');
    }

    // Get all feedback items for the requested type
    const items = this.feedbackData[type];

    // Return a random item
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Play a random feedback audio and return the corresponding text
   *
   * @param type - The type of feedback (pass or fail)
   * @returns The feedback text
   */
  async playRandomFeedback(type: FeedbackType): Promise<string> {
    const feedback = await this.getRandomFeedback(type);

    try {
      // Play the audio
      const audioPath = `${AUDIO_FEEDBACK_BASE}${feedback.audio}`;
      console.log(`Playing feedback audio: ${audioPath}`);
      await audioService.playAudio(audioPath);
    } catch (e) {
      console.error(`Error playing feedback audio: ${feedback.audio}`, e);
    }

    // Return the text
    return feedback.text;
  }
}

// Export singleton instance
export const speechService = new SpeechService();