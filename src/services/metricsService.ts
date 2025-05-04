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
    // Create a new session
    const sessionId = uuidv4();
    const session: PracticeSession = {
      id: sessionId,
      startTime: Date.now(),
      endTime: null,
      difficultyLevel,
      totalPractices: 0,
      correctPractices: 0,
      retryCount: 0,
      successfulRetries: 0,
      averageResponseTimeMs: 0,
      contrastTypes: [],
    };
    
    // Save the session
    await dbService.savePracticeSession(session);
    
    // Set as current session
    this.currentSession = session;
    
    return sessionId;
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
    
    // Update the session end time
    this.currentSession.endTime = Date.now();
    
    // Save the session
    await dbService.savePracticeSession(this.currentSession);
    
    // Clear the current session
    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    
    return completedSession;
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
    isRetry?: boolean;
    attemptCount?: number;
  }): Promise<PracticeResult> {
    const { 
      wordPair, 
      selectedWord, 
      targetWord, 
      responseTimeMs,
      isRetry = false,
      attemptCount = 1
    } = data;

    // Make sure we have an active session
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession first.');
    }
    
    // Create the practice result
    const isCorrect = selectedWord === targetWord;
    const result: PracticeResult = {
      id: uuidv4(),
      sessionId: this.currentSession.id,
      wordPairId: wordPair.id,
      targetWord,
      selectedWord,
      isCorrect,
      responseTimeMs,
      timestamp: Date.now(),
      contrastType: wordPair.contrastType,
      difficultyLevel: wordPair.difficultyLevel,
      isRetry,
      attemptCount
    };
    
    // Save the result
    await dbService.savePracticeResult(result);
    
    // Update the session statistics
    this.currentSession.totalPractices += 1;
    if (isCorrect) {
      this.currentSession.correctPractices += 1;
    }
    
    // Update retry statistics if applicable
    if (isRetry) {
      // Initialize retry fields if they don't exist yet
      if (!('retryCount' in this.currentSession)) {
        this.currentSession.retryCount = 0;
        this.currentSession.successfulRetries = 0;
      }
      
      this.currentSession.retryCount = (this.currentSession.retryCount || 0) + 1;
      if (isCorrect) {
        this.currentSession.successfulRetries = (this.currentSession.successfulRetries || 0) + 1;
      }
    }
    
    // Update average response time
    const totalResponseTime = this.currentSession.averageResponseTimeMs * (this.currentSession.totalPractices - 1) + responseTimeMs;
    this.currentSession.averageResponseTimeMs = totalResponseTime / this.currentSession.totalPractices;
    
    // Add the contrast type if it's not already in the list
    if (!this.currentSession.contrastTypes.includes(wordPair.contrastType)) {
      this.currentSession.contrastTypes = [...this.currentSession.contrastTypes, wordPair.contrastType];
    }
    
    // Save the updated session
    await dbService.savePracticeSession(this.currentSession);
    
    return result;
  }
  
  /**
   * Get the current session
   */
  getCurrentSession(): PracticeSession | null {
    return this.currentSession;
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
    const sessions = await dbService.getAllPracticeSessions();
    return sessions
      .filter(session => session.endTime !== null)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
      .slice(0, limit);
  }
}

// Export singleton instance
export const metricsService = new MetricsService();