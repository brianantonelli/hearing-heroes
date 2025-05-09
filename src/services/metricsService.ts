import { v4 as uuidv4 } from 'uuid';
import { dbService } from './dbService';
import { PracticeResult, PracticeSession, PracticeResultQuery, OverallStatistics } from '../types/metrics';
import { WordPair, ContrastType } from '../types/wordPairs';

/**
 * Service for handling metrics collection and analysis
 */
export class MetricsService {
  private currentSession: PracticeSession | null = null;

  /**
   * Start a new practice session
   *
   * @param difficultyLevel - The difficulty level for this session
   * @returns The new session ID
   */
  async startSession(difficultyLevel: number): Promise<string> {
    try {
      // Create a new session
      const sessionId = uuidv4();
      const session: PracticeSession = {
        id: sessionId,
        startTime: Date.now(),
        endTime: null,
        difficultyLevel,
        totalPractices: 0,
        correctPractices: 0,
        averageResponseTimeMs: 0,
        contrastTypes: [],
      };

      // Save the session
      await dbService.savePracticeSession(session);

      // Set as current session
      this.currentSession = session;

      return sessionId;
    } catch (error) {
      console.error('MetricsService: Error starting session:', error);
      throw error;
    }
  }

  /**
   * End the current practice session
   *
   * @returns The updated session
   */
  async endSession(): Promise<PracticeSession | null> {

    if (!this.currentSession) {
      return null;
    }

    try {
      // Update the session end time
      this.currentSession.endTime = Date.now();

      // Save the session
      await dbService.savePracticeSession(this.currentSession);

      // Clear the current session
      const completedSession = { ...this.currentSession };
      this.currentSession = null;

      return completedSession;
    } catch (error) {
      console.error('EndSession: Error ending session:', error);

      // Force clear the session even on error to prevent zombie sessions
      this.currentSession = null;

      // Re-throw to allow caller to handle if needed
      throw error;
    }
  }

  /**
   * Record a practice result
   *
   * @param data - Object containing practice result data
   * @returns The recorded practice result
   */
  async recordPractice(data: {
    wordPair: WordPair;
    selectedWord: string;
    targetWord: string;
    responseTimeMs: number;
  }): Promise<PracticeResult> {
    const { wordPair, selectedWord, targetWord, responseTimeMs } = data;

    try {
      // Make sure we have an active session
      if (!this.currentSession) {
        console.error('MetricsService: No active session found!');
        throw new Error('No active session. Call startSession first.');
      }

      // Deep validation of the wordPair object
      if (!wordPair) {
        console.error('MetricsService: Word pair is null or undefined');
        throw new Error('Word pair is required');
      }

      // Create a valid wordPair if the provided one is missing fields
      const validatedWordPair: WordPair = {
        // Default values for required fields if missing
        id: wordPair.id || `dynamic_id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        word1: wordPair.word1 || 'unknown_word1',
        word2: wordPair.word2 || 'unknown_word2',
        audioPrompt1: wordPair.audioPrompt1 || 'unknown.mp3',
        audioPrompt2: wordPair.audioPrompt2 || 'unknown.mp3',
        image1: wordPair.image1 || 'placeholder.png',
        image2: wordPair.image2 || 'placeholder.png',
        contrastType: wordPair.contrastType || 'plosive-voiced-unvoiced',
        difficultyLevel: wordPair.difficultyLevel || this.currentSession.difficultyLevel || 1,
      };

      // Create the practice result
      const isCorrect = selectedWord === targetWord;
      const result: PracticeResult = {
        id: uuidv4(),
        sessionId: this.currentSession.id,
        wordPairId: validatedWordPair.id,
        targetWord: targetWord || 'unknown_target',
        selectedWord: selectedWord || 'unknown_selected',
        isCorrect,
        responseTimeMs: responseTimeMs || 0,
        timestamp: Date.now(),
        contrastType: validatedWordPair.contrastType,
        difficultyLevel: validatedWordPair.difficultyLevel,
      };

      try {
        // Save the result
        await dbService.savePracticeResult(result);

        // Update the session statistics
        this.currentSession.totalPractices += 1;
        if (isCorrect) {
          this.currentSession.correctPractices += 1;
        }

        // Update average response time
        const totalResponseTime =
          this.currentSession.averageResponseTimeMs * (this.currentSession.totalPractices - 1) +
          responseTimeMs;
        this.currentSession.averageResponseTimeMs =
          totalResponseTime / this.currentSession.totalPractices;

        // Add the contrast type if it's not already in the list
        if (
          validatedWordPair.contrastType &&
          !this.currentSession.contrastTypes.includes(validatedWordPair.contrastType)
        ) {
          this.currentSession.contrastTypes = [
            ...this.currentSession.contrastTypes,
            validatedWordPair.contrastType,
          ];
        }

        // Save the updated session
        await dbService.savePracticeSession(this.currentSession);

        return result;
      } catch (error) {
        console.error('MetricsService: Error saving practice result to database:', error);
        throw error;
      }
    } catch (error) {
      console.error('MetricsService: Error processing practice result:', error);

      // Create a fallback result for debugging purposes (won't be saved to DB)
      const fallbackResult: PracticeResult = {
        id: `error_${Date.now()}`,
        sessionId: this.currentSession?.id || 'no_session',
        wordPairId: wordPair?.id || 'no_word_pair',
        targetWord: targetWord || 'unknown',
        selectedWord: selectedWord || 'unknown',
        isCorrect: false,
        responseTimeMs: responseTimeMs || 0,
        timestamp: Date.now(),
        contrastType: wordPair?.contrastType || 'unknown',
        difficultyLevel: wordPair?.difficultyLevel || 1,
      };

      // Return the fallback result without throwing to prevent game disruption
      return fallbackResult;
    }
  }

  /**
   * Get the current session
   */
  getCurrentSession(): PracticeSession | null {
    return this.currentSession;
  }

  /**
   * Emergency method to fix missing session
   * This can be used to restore a session state when it's unexpectedly missing
   */
  async restoreSession(level: number): Promise<string> {
    if (this.currentSession) {
      return this.currentSession.id;
    }
    return this.startSession(level);
  }

  /**
   * Get overall statistics
   */
  async getOverallStatistics(): Promise<OverallStatistics> {
    return dbService.calculateOverallStatistics();
  }

  /**
   * Get practice results with optional filtering
   */
  async getPracticeResults(query: PracticeResultQuery): Promise<PracticeResult[]> {
    return dbService.queryPracticeResults(query);
  }

  /**
   * Get all practice sessions
   */
  async getAllSessions(): Promise<PracticeSession[]> {
    return dbService.getAllPracticeSessions();
  }

  /**
   * Get practice session by ID
   */
  async getPracticeSession(id: string): Promise<PracticeSession | undefined> {
    return dbService.getPracticeSession(id);
  }

  /**
   * Get practice sessions by difficulty level
   */
  async getSessionsByLevel(level: number): Promise<PracticeSession[]> {
    return dbService.getSessionsByLevel(level);
  }

  /**
   * Calculate accuracy for a specific contrast type
   */
  async getContrastAccuracy(contrastType: ContrastType): Promise<number> {
    const results = await dbService.queryPracticeResults({ contrastType });
    const totalPractices = results.length;
    const correctPractices = results.filter(result => result.isCorrect).length;
    return totalPractices > 0 ? (correctPractices / totalPractices) * 100 : 0;
  }

  /**
   * Get recent practice sessions
   *
   * @param limit - Maximum number of sessions to return
   */
  async getRecentSessions(limit = 10): Promise<PracticeSession[]> {
    try {
      const sessions = await dbService.getAllPracticeSessions();

      // Check if we have any sessions without endTime
      const ongoingSessions = sessions.filter(session => session.endTime === null);
      if (ongoingSessions.length > 0) {
        console.warn('MetricsService: Found ongoing sessions:', ongoingSessions);
      }

      // Filter out only completed sessions (with endTime) and sort them
      const filteredSessions = sessions
        .filter(session => {
          const isCompleted = session.endTime !== null;
          return isCompleted;
        })
        .sort((a, b) => {
          // Safely handle the case where endTime might be null (though filter should catch this)
          const endTimeA = a.endTime || 0;
          const endTimeB = b.endTime || 0;
          return endTimeB - endTimeA;
        })
        .slice(0, limit);

      return filteredSessions;
    } catch (error) {
      console.error('MetricsService: Error getting recent sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const metricsService = new MetricsService();